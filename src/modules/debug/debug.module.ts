import { Module } from "@nestjs/common";
import DebugController from "./debug.controller";

@Module({
    controllers: [DebugController]
})
export default class DebugModule {}