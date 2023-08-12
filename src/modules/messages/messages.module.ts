import { forwardRef, Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import MessageEntity from "./message.model";
import { MessagesService } from "./messages.service";
import AttachmentEntity from "../attachments/attachment.model";
import { TokensModule } from "../tokens/tokens.module";
import ChatUserEntity from "../chat-users/chat-user.model";
import { ChatsModule } from "../chats/chats.module";
import MessagesController from "./messages.controller";
import { UsersModule } from "../users/users.module";
import { EventsModule } from "../events/events.module";
import AttachmentsModule from "../attachments/attachments.module";
import FcmModule from "../fcm/fcm.module";
import UserEntity from "../users/user.model";

@Module({
    controllers: [MessagesController],
    providers: [MessagesService],
    imports: [
        SequelizeModule.forFeature([ MessageEntity, AttachmentEntity, ChatUserEntity, UserEntity ]),
        forwardRef(() => UsersModule),
        TokensModule,
        ChatsModule,
        AttachmentsModule,
        FcmModule,
        forwardRef(() => EventsModule)
    ],
    exports: [
        MessagesService
    ]
})
export class MessagesModule {}
