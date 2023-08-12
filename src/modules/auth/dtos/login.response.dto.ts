import { UserRole } from "../../users/user.model";
import { Expose, Type } from "class-transformer";

class LoginResponseDto {
    @Expose()
    public access_token: string;

    @Expose()
    public refresh_token: string;

    @Expose()
    @Type(() => UserResponseDto)
    public user: UserResponseDto;
}

export class UserResponseDto {
    @Expose()
    id: number;

    @Expose()
    email: string;

    @Expose()
    role: string;

    @Expose()
    firstname: string;

    @Expose()
    lastname: string;
}

export default LoginResponseDto;