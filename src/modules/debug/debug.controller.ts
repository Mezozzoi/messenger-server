import { Body, Controller, Post } from "@nestjs/common";

@Controller("/debug")
export default class DebugController {
    @Post("/exception")
    async Exception(@Body() exception: any) {
        console.log("[Debug feedback]: ", exception);
        return true;
    }
}