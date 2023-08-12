import { IsNumber, IsOptional, IsString } from "class-validator";

class MessageSendDto {
    @IsNumber()
    chatId: number;

    @IsOptional()
    @IsString()
    content: string;
}

export default MessageSendDto;