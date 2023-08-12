import { forwardRef, Module } from "@nestjs/common";
import FcmService from "./fcm.service";
import FcmController from "./fcm.controller";
import { TokensModule } from "../tokens/tokens.module";
import { UsersModule } from "../users/users.module";
import { SequelizeModule } from "@nestjs/sequelize";
import FcmTokenEntity from "./fcm-token.model";

@Module({
    controllers: [FcmController],
    providers: [FcmService],
    imports: [
        SequelizeModule.forFeature([FcmTokenEntity]),
        TokensModule,
        forwardRef(() => UsersModule)
    ],
    exports: [FcmService]
})
export default class FcmModule {}