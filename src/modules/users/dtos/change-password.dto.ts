import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

class ChangePasswordDto {
    @IsString()
    @IsNotEmpty({ message: "Password is required" })
    public oldPassword!: string;

    @MaxLength(32, { message: "Password must be no longer than 32 symbols" })
    @MinLength(8, { message: "Password must be at least 8 symbols" })
    @IsString()
    @IsNotEmpty({ message: "Password is required" })
    public newPassword!: string;
}

export default ChangePasswordDto;