import { Body, Controller, Post, Req } from "@nestjs/common";
import { Auth } from "../../common/decorators/auth.decorator";
import FcmService from "./fcm.service";
import { Request } from "express";
import RegisterTokenDto from "./dtos/register-token.dto";

@Controller("fcm")
export default class FcmController {
    constructor(private fcmService: FcmService) {}

    @Auth()
    @Post("/registerToken")
    async sendToken(@Req() req: Request,
              @Body() body: RegisterTokenDto) {
        await this.fcmService.registerToken(req.user, body.token);
    }
}