import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/guards/auth.guard";

export const Auth = () => UseGuards(AuthGuard)