import { forwardRef, Module } from "@nestjs/common";
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatsController } from "./chats.controller";
import { ChatsService } from "./chats.service";
import ChatEntity from "./chat.model";
import MessageEntity from "../messages/message.model";
import ChatUserEntity from "../chat-users/chat-user.model";
import { TokensModule } from "../tokens/tokens.module";
import { UsersModule } from "../users/users.module";
import UserEntity from "../users/user.model";
import { EventsModule } from "../events/events.module";
import S3Module from "../s3/s3.module";

@Module({
    controllers: [ChatsController],
    providers: [ChatsService],
    imports: [
        SequelizeModule.forFeature([ ChatEntity, MessageEntity, ChatUserEntity, UserEntity ]),
        TokensModule,
        forwardRef(() => UsersModule),
        S3Module,
        forwardRef(() => EventsModule)
    ],
    exports: [
        ChatsService
    ]
})
export class ChatsModule {}
