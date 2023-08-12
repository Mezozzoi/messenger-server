import { IsNumber, IsOptional, IsString } from "class-validator";

export default class EditMessageDto {
    id: number;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    attachments?: Express.Multer.File[];
}