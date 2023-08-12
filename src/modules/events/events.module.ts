import { Module } from "@nestjs/common";
import { EventsGateway } from "./events.gateway";
import { SequelizeModule } from "@nestjs/sequelize";
import ChatEntity from "../chats/chat.model";
import { ChatsModule } from "../chats/chats.module";
import { MessagesModule } from "../messages/messages.module";

@Module({
    providers: [EventsGateway],
    imports: [
        MessagesModule,
        ChatsModule,
        SequelizeModule.forFeature([ChatEntity]),
    ],
    exports: [EventsGateway]
})
export class EventsModule {
}