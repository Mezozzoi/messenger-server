import { forwardRef, Inject, UseFilters, UsePipes } from "@nestjs/common";
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { SocketData } from "src/common/types/socket-data";
import { SocketExceptionsFilter } from "src/filters/socket-catch.filter";
import Validation from "src/pipes/validation.pipe";
import { ChatsService } from "../chats/chats.service";
import { MessagesService } from "../messages/messages.service";
import MessageEntity from "../messages/message.model";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import AppSocket from "../../common/types/socket";
import ChatEntity, { ChatType } from "../chats/chat.model";
import UserEntity from "../users/user.model";

@UsePipes(Validation)
@UseFilters(SocketExceptionsFilter)
@WebSocketGateway({})
export class EventsGateway implements OnGatewayConnection {
    constructor(
        private chatsService: ChatsService,
        @Inject(forwardRef(() => MessagesService)) private messagesService: MessagesService) {
    }

    @WebSocketServer()
    server: Server<DefaultEventsMap, any, DefaultEventsMap, SocketData>;

    async handleConnection(client: AppSocket, ...args: any[]) {
        const chats = await this.chatsService.findAllByMember(client.data.userId);

        chats.forEach(c => {
            client.join("chat/" + String(c.id));

            if (c.type === ChatType.DIALOGUE) {
                client.join("user/" + String(c.members.find(m => m.id !== client.data.userId).id));
            }
        });
    }

    @SubscribeMessage("sendMessage")
    async handleMessage(client: AppSocket, payload: {chatId: number, content?: string}) {
        await this.messagesService.sendMessage(client.data.user, payload.chatId, payload.content);
    }

    async emitMessageToChat(chatId: number, message: MessageEntity) {
        this.server.in("chat/" + String(chatId)).emit("receiveMessage", message);
    }

    async connectToCreatedChat(chat: ChatEntity, userId: number) {
        this.server.fetchSockets().then(sockets => sockets.forEach(socket => {
            if (socket.data.user.id === userId) {
                socket.join("chat/" + String(chat.id));

                if (chat.type === ChatType.DIALOGUE) {
                    socket.join("user/" + String(userId));
                }

                socket.emit("joinedToChat", {chatId: chat.id});
            }
        }));
    }

    async emitChatDeleted(chatId: number) {
        this.server.in("chat/" + String(chatId)).emit("chatDeleted", {chatId});
        this.server.in("chat/" + String(chatId)).socketsLeave(String(chatId));
    }

    async emitChatEdited(chat: ChatEntity, isAvatarEdited: boolean) {
        delete chat.dataValues.avatar;
        this.server.in("chat/" + String(chat.id)).emit("chatEdited", {
            chat: chat.dataValues,
            isAvatarEdited
        });
    }

    async emitUserEdited(user: UserEntity, isAvatarEdited: boolean) {
        delete user.dataValues.avatar;
        this.server.in("user/" + String(user.id)).emit("userEdited", {
            user: user.dataValues,
            isAvatarEdited
        });
    }

    async emitMessageDeleted(messageId: number, chatId: number) {
        this.server.in("chat/" + String(chatId)).emit("messageDeleted", {
            chatId,
            messageId
        });
    }

    async emitMessageEdited(message: MessageEntity) {
        this.server.in("chat/" + String(message.chatId)).emit("messageEdited", {
            message: message.dataValues
        })
    }
}