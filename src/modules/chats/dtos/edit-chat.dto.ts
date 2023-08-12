import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

class EditChatDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name?: string;

    @IsOptional()
    avatar?: Express.Multer.File;
}

export default EditChatDto;