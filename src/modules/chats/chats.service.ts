import { forwardRef, HttpException, HttpStatus, Inject, Injectable, NotImplementedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import ChatEntity, { ChatCreateType, ChatType } from "./chat.model";
import MessageEntity from "../messages/message.model";
import ChatUserEntity from "../chat-users/chat-user.model";
import UserEntity from "../users/user.model";
import sequelize, { Op } from "sequelize";
import { EventsGateway } from "../events/events.gateway";
import EditChatDto from "./dtos/edit-chat.dto";
import S3Service from "../s3/s3.service";
import * as crypto from "crypto";

@Injectable()
export class ChatsService {

    constructor(@InjectModel(ChatEntity) private chatRepository: typeof ChatEntity,
                @InjectModel(MessageEntity) private messageRepository: typeof MessageEntity,
                @InjectModel(ChatUserEntity) private chatUserRepository: typeof ChatUserEntity,
                @InjectModel(UserEntity) private userRepository: typeof UserEntity,
                private s3Service: S3Service,
                @Inject(forwardRef(() => EventsGateway)) private eventsGateway: EventsGateway) {
    }

    async createGroup(user: UserEntity, chatProps: Omit<ChatCreateType, "type">): Promise<ChatEntity> {
        if (!chatProps.users) chatProps.users = [];
        chatProps.users.push(user.id);

        const chat = await this.chatRepository.create({
            type: ChatType.GROUP,
            ...chatProps
        });
        for (const member of chatProps.users) {
            await this.join(member, chat.id, false);
            await this.eventsGateway.connectToCreatedChat(chat, member);
        }

        return chat;
    }

    async createDialogue(user: UserEntity, participant: number): Promise<ChatEntity> {
        if (participant === user.id)
            throw new HttpException("Users must be different.", 400);

        if (!await this.userRepository.findByPk(participant))
            throw new HttpException("User with such id does not exist.", 400);

        const dialogue = await this.findDialogue(user.id, participant);

        if (dialogue)
            throw new HttpException("Dialogue with this user already exists.", 400);

        const chat = await this.chatRepository.create({
            type: ChatType.DIALOGUE,
            users: [user.id, participant],
            ownerId: user.id
        });

        await this.join(user.id, chat.id, true);
        await this.join(participant, chat.id, true);

        await this.eventsGateway.connectToCreatedChat(chat, user.id);
        await this.eventsGateway.connectToCreatedChat(chat, participant);

        return chat;
    }

    async findDialogue(userIdA: number, userIdB: number): Promise<ChatEntity | null> {
        if (userIdA === userIdB)
            throw new Error("Users must be different");

        const dialogue = (await this.chatRepository.findAll({
            where: {
                type: ChatType.DIALOGUE
            },
            include: [
                {
                    model: UserEntity,
                    where: {
                        id: {
                            [Op.or]: [userIdA, userIdB],
                        },
                    },
                    attributes: [],
                    through: {
                        attributes: []
                    },
                    as: "members"
                },
            ],
            group: ['ChatEntity.id'],
            having: sequelize.where(sequelize.fn("COUNT", sequelize.col("members.id")), "=", 2)
        }))[0];

        return dialogue;
    }

    async search(user: UserEntity, query: string): Promise<{ chats: ChatEntity[], users: UserEntity[] }> {
        const chats = await this.chatRepository.findAll({
            where: { name: { [Op.iLike]: `%${query}%` } },
        }) || [];
        const users = await this.userRepository.findAll({
            where: {
                id: {[Op.ne]: user.id},
                [Op.or]: [
                    { firstname: { [Op.iLike]: `%${query}%` } },
                    { lastname: { [Op.iLike]: `%${query}%` } },
                ],
            },
        }) || [];
        return { chats, users };
    }

    findById(id: number): Promise<ChatEntity> {
        return this.chatRepository.findOne({ where: { id }, include: [
                {model: UserEntity, as: "members", attributes: ["id"]}
            ] });
    }

    async findAllByMember(memberId: number): Promise<ChatEntity[]> {
        const chats = (await this.userRepository.findByPk(memberId, {
            include: {model: ChatEntity, include: [
                {model: UserEntity, as: "members", attributes: ["id"]}
                ]}
        })).chats
        for (const e of chats) {
            if (e.type === ChatType.DIALOGUE) {
                const participant = (await e.$get("members", {
                    where: {
                        id: {[Op.ne]: memberId}
                    },
                    attributes: ["firstname", "lastname"]
                }))[0];
                e.name = participant.firstname + " " + participant.lastname
            }
        }
        return chats;
    }

    async isMember(userId: number, chatId: number): Promise<boolean> {
        const chat_user = await this.chatUserRepository.findOne({ where: { chatId, userId } });
        return chat_user != null;
    }

    async join(userId: number, chatId: number, force?: boolean): Promise<void> {
        const chat = await this.chatRepository.findByPk(chatId);
        if (chat == null || chat.type === ChatType.DIALOGUE && !force)
            throw new HttpException("Wrong chat id or chat is private.", HttpStatus.BAD_REQUEST);

        if (await this.isMember(userId, chatId))
            throw new HttpException("You are already a member of this chat.", HttpStatus.BAD_REQUEST);

        await this.chatUserRepository.create({ chatId, userId });
    }

    async leave(user: UserEntity, chatId: number): Promise<{ chatId: number }> {
        if ((await this.chatRepository.findByPk(chatId, { attributes: ["type"] })).type === ChatType.DIALOGUE)
            throw new HttpException("You are not able to leave dialogue chat.", HttpStatus.BAD_REQUEST);

        if (!await this.isMember(user.id, chatId))
            throw new HttpException("You are not a member of this chat.", HttpStatus.BAD_REQUEST);

        await this.chatUserRepository.destroy({ where: { chatId, userId: user.id } });

        return { chatId };
    }

    async delete(user: UserEntity, chatId: number): Promise<{ chatId: number }> {
        const chat = await this.chatRepository.findOne({ where: { id: chatId }, include: "owner" });
        if (chat.type === ChatType.GROUP && chat.owner.id !== user.id)
            throw new HttpException("You have no permissions to delete this chat.", HttpStatus.BAD_REQUEST);

        await chat.destroy({hooks: true});

        await this.eventsGateway.emitChatDeleted(chatId);

        return { chatId };
    }

    banMember(admin: UserEntity, memberId: number, chatId: number) {
        throw new NotImplementedException();
    }

    unbanMember(admin: UserEntity, memberId: number, chatId: number) {
        throw new NotImplementedException();
    }

    async editChat(user: UserEntity, chatId: number, editOptions: EditChatDto): Promise<ChatEntity> {
        const chat = await this.chatRepository.findByPk(chatId);
        const key = crypto.randomUUID();

        if (chat.type === ChatType.DIALOGUE)
            throw new HttpException("Dialogue chats can not be modified.", HttpStatus.BAD_REQUEST);

        if (chat.ownerId !== user.id)
            throw new HttpException("You have no permissions to edit chat.", HttpStatus.BAD_REQUEST);

        if (editOptions.avatar) {
            await this.s3Service.uploadChatAvatar(key, editOptions.avatar.buffer);
            await chat.update({
                avatar: key,
            });
        }
        await chat.update({
            name: editOptions?.name,
        });

        this.eventsGateway.emitChatEdited(chat, !!editOptions.avatar);

        return chat;
    }

    async getAvatar(user: UserEntity, chatId: number): Promise<Buffer | undefined> {
        const chat = await this.chatRepository.findByPk(chatId, { attributes: ["avatar"] });

        if (!chat) throw new HttpException("No chat found.", 400);

        if (chat.type === ChatType.DIALOGUE) {
            const companion = (await this.chatUserRepository.findOne({
                where: { chatId, userId: { [Op.ne]: user.id } },
                include: { model: UserEntity, attributes: ["avatar"] },
            })).user;
            return this.s3Service.getUserAvatar(companion.avatar);
        }

        return this.s3Service.getChatAvatar(chat.avatar);
    }
}