import { HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDto } from '../dto/create-user-dto';
import CustomResponse from 'src/response/custom-response';
import { CloudinaryService } from 'src/modules/cloudinary/services/cloudinary.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/models/user/user.model';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class AuthService {
    constructor(
        private cloudinaryService: CloudinaryService,
        @InjectModel("User")
        private userModel: Model<UserDocument>,
        private jwtService: JwtService,
        private mailService: MailerService
    ) { }


    private async setAuthCookie(user: any, res: Response) {
        const payload = { sub: user._id, email: user.email };
        const token = this.jwtService.sign(payload);

        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // true in production with HTTPS
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 1 hour
        });

        return token;
    }

    async registerUser(createUserDto: CreateUserDto, file: Express.Multer.File, res: Response) {
        try {
            let photoUrl;
            if (file) {
                photoUrl = (await this.cloudinaryService.uploadFile(file)).secure_url;
            }

            const exisitingUser = await this.userModel.findOne({
                email: createUserDto.email
            })

            if (exisitingUser) {
                return new CustomResponse({
                    statusCode: HttpStatus.CONFLICT,
                    message: "User already exists",
                    data: exisitingUser
                });

            }

            const hashedPasswrd = await bcrypt.hash(createUserDto.password, 10);

            const newUser = {
                ...createUserDto,
                password: hashedPasswrd,
                photoUrl: photoUrl
            }

            const user = await this.userModel.create(newUser);


            await this.setAuthCookie(user, res);




            return new CustomResponse({
                statusCode: HttpStatus.CREATED,
                message: "User registered successfully",
                data: user
            });




        } catch (error) {
            console.error("Error registering user", error)
            return new CustomResponse({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Error registering user",
                data: null
            });
        }
    }


    async loginUser(createUserDto: CreateUserDto, res: Response) {
        try {
            const user = await this.userModel.findOne({
                email: createUserDto.email
            })
            if (!user) {
                return new CustomResponse({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: "User not found",
                    data: null
                });
            }

            const passwordMatch = await bcrypt.compare(createUserDto.password, user?.password);
            if (!passwordMatch) {
                return new CustomResponse({
                    statusCode: HttpStatus.UNAUTHORIZED,
                    message: "Invalid credentials",
                    data: null
                });
            }

            await this.setAuthCookie(user, res);

            return new CustomResponse({
                statusCode: HttpStatus.OK,
                message: "User logged in successfully",
                data: user
            });
        } catch (error) {
            console.error("Error logging in user", error)
            return new CustomResponse({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Error logging in user",
                data: null
            });

        }
    }

    async logoutUser(res: Response) {
        try {
            res.clearCookie('token');
            return new CustomResponse({
                statusCode: HttpStatus.OK,
                message: "User logged out successfully",
                data: null
            });
        } catch (error) {
            console.error("Error logging out user", error)
            return new CustomResponse({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Error logging out user",
                data: null
            });

        }
    }

    async googleAuth(createUserDto: CreateUserDto, res: Response, file: Express.Multer.File) {
        try {

            const photoUrl = (await this.cloudinaryService.uploadFile(file)).secure_url;
            let user = await this.userModel.findOne({
                email: createUserDto.email
            })

            if (!user) {
                user = await this.userModel.create({
                    ...createUserDto,
                    photoUrl
                })
            } else {
                if (!user.photoUrl && photoUrl) {
                    user.photoUrl = photoUrl;
                    await user.save();
                }
            }

            await this.setAuthCookie(user, res);
            return new CustomResponse({
                statusCode: HttpStatus.OK,
                message: "User logged in successfully",
                data: user
            });

        } catch (error) {
            console.error("Error with google auth", error)
            return new CustomResponse({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Error with google auth",
                data: null
            });

        }

    }

    async sendOtp(email: string) {
        try {
            const user = await this.userModel.findOne({
                email
            })



            if (!user) {
                return new CustomResponse({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: "User not found",
                    data: null
                });
            }

            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            user.resetOtp = otp;
            user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
            user.otpVerified = false;

            await user.save();

            await this.mailService.sendMail({
                to: email,
                subject: "OTP for password reset",
                text: `<p>Your OTP for Password Reset is <b>${otp}</b>.
        It expires in 5 minutes.</p>`
            })
        } catch (error) {
            console.error("Error sending otp", error)
            return new CustomResponse({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Error sending otp",
                data: null
            });

        }
    }

    async verifyOtp(email: string, otp: string) { 
        try {
            const user = await this.userModel.findOne({
                email
            })
            if (!user) {
                return new CustomResponse({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: "User not found",
                    data: null
                });
            }

            if(user?.resetOtp !== otp || !user?.otpExpires || user?.otpExpires < new Date()){
                return new CustomResponse({
                    statusCode: HttpStatus.UNAUTHORIZED,
                    message: "Invalid or expired OTP",
                    data: null
                });
            }

            user.otpVerified = true;
            user.resetOtp = null;
            user.otpExpires = null;

            await user.save();
            return new CustomResponse({
                statusCode: HttpStatus.OK,
                message: "OTP verified successfully",
                data: null
            });
        } catch (error) {
            console.error("Error verifying otp", error)
            return new CustomResponse({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Error verifying otp",
                data: null
            });
        }
    }

    async resetPassword(email: string, password: string) { 
        try {
            const user = await this.userModel.findOne({
                email
            })
            if (!user) {
                return new CustomResponse({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: "User not found",
                    data: null
                });
            }

            if(!user.otpVerified) {
                return new CustomResponse({
                    statusCode: HttpStatus.UNAUTHORIZED,
                    message: "OTP not verified",
                    data: null
                });
            }

            const hashedPasswrd = await bcrypt.hash(password, 10);
            user.password = hashedPasswrd;
            user.otpVerified = false;
            await user.save();



            return new CustomResponse({
                statusCode: HttpStatus.OK,
                message: "Password reset successfully",
                data: null
            });
        } catch (error) {
            console.error("Error resetting password", error)
            return new CustomResponse({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Error resetting password",
                data: null
            });
            
        }
    }
}