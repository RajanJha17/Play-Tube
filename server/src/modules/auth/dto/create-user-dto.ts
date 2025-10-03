import { IsEmail, IsOptional, IsString } from "class-validator";


export class CreateUserDto{

    @IsString()
    @IsOptional()
    userName: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;
}