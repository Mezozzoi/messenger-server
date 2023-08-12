import { IsEmail, IsNotEmpty, IsString } from "class-validator";

class LoginDto {

    @IsEmail({}, { message: "Invalid email" })
    @IsNotEmpty({ message: "Email is required" })
    public email!: string;

    @IsString()
    @IsNotEmpty({ message: "Password is required" })
    public password!: string;
}

export default LoginDto;