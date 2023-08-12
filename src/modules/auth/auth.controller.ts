import { Body, Controller, Post, Res } from "@nestjs/common";
import { Response } from "express";
import { Cookies } from "src/common/decorators/cookie.decorator";
import UserCreateDto from "../users/dtos/user-create.dto";
import { AuthService } from "./auth.service";
import LoginDto from "./dtos/login-dto";
import { Auth } from "src/common/decorators/auth.decorator";
import LoginResponseDto from "./dtos/login.response.dto";

@Controller("auth")
export class AuthController {

    constructor(private authService: AuthService) {
    }

    @Post("/register")
    async register(
        @Body() userCreateDto: UserCreateDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const authData = await this.authService.register(userCreateDto);
        response.cookie("refreshToken", authData.refresh_token, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

        return authData;
    }

    @Post("/login")
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<LoginResponseDto> {
        const authData = await this.authService.auth(loginDto);
        response.cookie("refreshToken", authData.refresh_token, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

        return authData;
    }

    @Auth()
    @Post("/logout")
    async logout(
        @Cookies("refreshToken") refreshToken: string,
        @Res({ passthrough: true }) response: Response,
    ) {
        const user = await this.authService.logout(refreshToken);
        response.clearCookie("refreshToken");
    }

    @Post("/refresh")
    async refresh(
        @Cookies("refreshToken") refreshToken: string,
        @Res({ passthrough: true }) response: Response,
    ) {
        const authData = await this.authService.refresh(refreshToken);
        response.cookie("refreshToken", authData.refresh_token, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

        return authData;
    }
}
