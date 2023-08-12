import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

class EditProfileDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    firstname?: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    lastname?: string;

    @IsOptional()
    avatar?: Express.Multer.File;
}

export default EditProfileDto;