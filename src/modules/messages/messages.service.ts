import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import MessageEntity from "./message.model";
import AttachmentEntity from "../attachments/attachment.model";
import UserEntity from "../users/user.model";
import ChatUserEntity from "../chat-users/chat-user.model";
import { ChatsService } from "../chats/chats.service";
import { EventsGateway } from "../events/events.gateway";
import AttachmentsService from "../attachments/attachments.service";
import EditMessageDto from "./dtos/edit-message.dto";
import FcmService from "../fcm/fcm.service";
import { ChatType } from "../chats/chat.model";

@Injectable()
export class MessagesService {

    constructor(@InjectModel(MessageEntity) private messageRepository: typeof MessageEntity,
                @InjectModel(ChatUserEntity) private  chatUserRepository: typeof ChatUserEntity,
                @InjectModel(UserEntity) private  userRepository: typeof UserEntity,
                private fcmService: FcmService,
                private attachmentService: AttachmentsService,
                private chatsService: ChatsService,
                @Inject(forwardRef(() => EventsGateway)) private eventsGateway: EventsGateway) {}

    async sendMessage(user: UserEntity, chatId: number, content?: string, attachments?: Express.Multer.File[]): Promise<MessageEntity> {
        if (!content && !attachments)
            throw new HttpException("Content or attachment must be provided", HttpStatus.BAD_REQUEST);
        if (!await this.chatsService.isMember(user.id, chatId))
            throw new HttpException("You are not a member of this chat or it does not exist.", HttpStatus.BAD_REQUEST);

        const message = await this.messageRepository.create({ content, ownerId: user.id, chatId });

        if (attachments) {
            for (const attachment of attachments) {
                await this.attachmentService.addAttachment(attachment.originalname, message.id, attachment.buffer);
            }
        }

        const responseMessage = await this.messageRepository.findByPk(message.id, {
            include: [
                { model: AttachmentEntity, as: "attachments", attributes: ["id", "type", "filename", "size"] },
                { model: UserEntity, as: "owner", attributes: ["id", "firstname", "lastname"] }
            ]
        });

        const chat = await this.chatsService.findById(chatId);

        await this.eventsGateway.emitMessageToChat(chatId, responseMessage);
        const chatName =
            chat.type === ChatType.DIALOGUE && (await this.userRepository.findByPk(chat.members.find(m => m.id !== user.id)!.id)).name ||
            chat.type === ChatType.GROUP && chat.name;

        chat.members.forEach(m => {
            if (m.id !== user.id) {
                this.fcmService.pushMessage(m.id, {
                    chatName,
                    content: content,
                    attachments: attachments
                });
            }
        })

        return responseMessage;
    }

    findById(id: number): Promise<MessageEntity> {
        return this.messageRepository.findByPk(id);
    }

    async getFromChat(user: UserEntity, chatId: number, options: { offset: number, limit: number } = { offset: 0, limit: 20 }): Promise<MessageEntity[]> {
        if (!await this.chatsService.isMember(user.id, chatId))
            throw new HttpException("You are not a member of this chat or it does not exist.", HttpStatus.BAD_REQUEST);

        return this.messageRepository.findAll({
            where: { chatId },
            offset: options.offset,
            limit: options.limit,
            order: [["createdAt", "DESC"]],
            include: [
                { model: AttachmentEntity, as: "attachments", attributes: ["id", "type", "filename", "size"] },
                { model: UserEntity, as: "owner", attributes: ["id", "firstname", "lastname"] }
            ]
        });
    }

    async getLastMessage(user: UserEntity, chatId: number): Promise<MessageEntity> {
        if (!await this.chatsService.isMember(user.id, chatId))
            throw new HttpException("You are not a member of this chat or it does not exist.", HttpStatus.BAD_REQUEST);

        return this.messageRepository.findOne({
            where: { chatId },
            order: [["createdAt", "DESC"]],
            include: [
                { model: AttachmentEntity, as: "attachments", attributes: ["id", "type", "filename", "size"] },
                { model: UserEntity, as: "owner", attributes: ["id", "firstname", "lastname"] }
            ]
        });
    }

    async deleteMessage(user: UserEntity, messageId: number) {
        const message = await this.messageRepository.findByPk(messageId);

        if (!message || message.ownerId !== user.id || !await this.chatsService.isMember(user.id, message.chatId))
            throw new HttpException("No such message or you have no permissions to delete it.", 404);

        const {chatId, id} = message;

        await message.destroy();
        await this.attachmentService.deleteByMessageId(messageId);

        this.eventsGateway.emitMessageDeleted(id, chatId);
    }

    async editMessage(user: UserEntity, editOptions: EditMessageDto): Promise<MessageEntity> {
        if (!editOptions.content && !editOptions.attachments)
            throw new HttpException("Content or attachments must present", 400);

        const message = await this.messageRepository.findByPk(editOptions.id, {
            include: [
                { model: AttachmentEntity, as: "attachments", attributes: ["id", "type", "filename", "size"] },
                { model: UserEntity, as: "owner", attributes: ["id", "firstname", "lastname"] }
            ]
        });

        if (editOptions.attachments) {
            await this.attachmentService.deleteByMessageId(message.id);

            for (const attachment of editOptions.attachments) {
                await this.attachmentService.addAttachment(attachment.originalname, message.id, attachment.buffer);
            }
        }

        if (editOptions.content) await message.update({content: editOptions.content});

        this.eventsGateway.emitMessageEdited(message);

        return message;
    }
}