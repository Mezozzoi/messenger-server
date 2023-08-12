import { IsString } from "class-validator";

export default class RegisterTokenDto {
    @IsString()
    token: string;
}