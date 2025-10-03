import { Body, Controller, Get, Post, Req, Res, SetMetadata, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user-dto';
import { AuthService } from '../services/auth.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/guard/auth-guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {
    }

    @Post('register')
    @SetMetadata('auth',"content:post")
    @UseInterceptors(FileInterceptor('file'))
    async registerUser(@Body() createUserDto: CreateUserDto,
     @UploadedFile() file: Express.Multer.File,
     @Res({ passthrough: true }) res: Response,
    ){
          return this.authService.registerUser(createUserDto, file, res);
    }


    @Post('login')
    @SetMetadata('auth', "content:post")
    async loginUser(@Body() createUserDto: CreateUserDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        return this.authService.loginUser(createUserDto, res);
    }
    
    @UseGuards(JwtAuthGuard)
    @Get('logout')
    @SetMetadata('auth', "content:get")
    async logoutUser(@Res({ passthrough: true }) res: Response){
        return this.authService.logoutUser(res);

    }

    @Post("google-auth")
    @SetMetadata('auth', "content:post")
    @UseInterceptors(FileInterceptor('file'))
    async googleAuth(@Body() createUserDto: CreateUserDto,
        @UploadedFile() file: Express.Multer.File,
        @Res({ passthrough: true }) res: Response,
    ) {
        return this.authService.googleAuth(createUserDto, res,file);
    }

    @Post("send-otp")
    @SetMetadata('auth', "content:post")
    async sendOtp(@Body() email:string){
        return this.authService.sendOtp(email);
    }

    @Post("verify-otp")
    @SetMetadata('auth', "content:post")
    async verifyOtp(@Body() body: { email: string, otp: string }) {
        return this.authService.verifyOtp(body.email, body.otp);
    }
    

}