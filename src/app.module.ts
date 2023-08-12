import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./modules/auth/auth.module";
import { TokensModule } from "./modules/tokens/tokens.module";
import databaseConfig from "./config/database.config";
import { SeederModule } from "nestjs-sequelize-seeder";
import rootConfig from "./config/root.config";
import { EventsModule } from "./modules/events/events.module";
import { ChatsModule } from "./modules/chats/chats.module";
import { MessagesModule } from "./modules/messages/messages.module";
import AttachmentsModule from "./modules/attachments/attachments.module";
import DebugModule from "./modules/debug/debug.module";
import FcmModule from "./modules/fcm/fcm.module";

@Module({
    imports: [
        ConfigModule.forRoot(rootConfig()),
        SequelizeModule.forRoot(databaseConfig()),
        SeederModule.forRoot({}),
        UsersModule,
        AuthModule,
        TokensModule,
        EventsModule,
        AttachmentsModule,
        MessagesModule,
        ChatsModule,
        DebugModule,
        FcmModule
    ]
})
export class AppModule {
}
