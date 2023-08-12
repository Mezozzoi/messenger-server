import {
    ArrayMaxSize,
    IsArray,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength, MinLength,
    ValidateNested,
} from "class-validator";

class GroupChatCreateDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    @MinLength(3)
    public name: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMaxSize(100)
    @IsNumber()
    public members?: number[];
}

export default GroupChatCreateDto;