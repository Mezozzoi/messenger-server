import { IsNumber } from "class-validator";

export default class DialogueChatCreateDto {
    @IsNumber()
    participant: number;
}