import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

class UserCreateDto {

    @IsEmail({}, { message: "Uncorrect email" })
    @IsNotEmpty({ message: "Email is required" })
    public email!: string;

    @MaxLength(32, { message: "Password must be no longer than 32 symbols" })
    @MinLength(8, { message: "Password must be at least 8 symbols" })
    @IsString()
    @IsNotEmpty({ message: "Password is required" })
    public password!: string;

    @MaxLength(64, { message: "First name must be less than 64 symbols" })
    @MinLength(1, { message: "First name must be more than 1 symbols" })
    @IsString()
    @IsNotEmpty({ message: "First name is required" })
    public firstname!: string;

    @MaxLength(64, { message: "Last name must be less than 64 symbols" })
    @MinLength(1, { message: "Last name must be more than 1 symbols" })
    @IsString()
    @IsOptional({ message: "Last name is required" })
    public lastname!: string;
}

export default UserCreateDto;