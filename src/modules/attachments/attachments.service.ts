import { HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import AttachmentEntity from "./attachment.model";
import UserEntity from "../users/user.model";
import ChatEntity from "../chats/chat.model";
import MessageEntity from "../messages/message.model";
import S3Service from "../s3/s3.service";
import * as crypto from "crypto";
import getType from "../../common/functions/get-type";

@Injectable()
export default class AttachmentsService {
    constructor(
        @InjectModel(AttachmentEntity) private attachmentRepository: typeof AttachmentEntity,
        private s3Service: S3Service
    ) {}

    async addAttachment(filename: string, messageId: number, file: Buffer): Promise<AttachmentEntity> {
        const key = crypto.randomUUID();
        const size = file.byteLength;

        const attachment = await this.attachmentRepository.create({
            key,
            type: getType(filename),
            filename: filename,
            messageId,
            size
        });

        try {
            await this.s3Service.uploadAttachment(key, file)
        } catch {
            await attachment.destroy();
        }

        return attachment;
    }

    async getById(user: UserEntity, id: number): Promise<AttachmentEntity> {
        if (!await this.isReachable(user, id))
            throw new HttpException("Attachment is not available or existing", 401)

        const attachment = await this.attachmentRepository.findByPk(id);
        if (!attachment) throw new NotFoundException();

        return attachment;
    }

    async getFile(key: string) {
        return this.s3Service.getAttachment(key);
    }

    async getChunk(user: UserEntity, id: number, start: number, end: number): Promise<Buffer> {
        return (await this.attachmentRepository.sequelize.query(
                `SELECT SUBSTRING(b, ${start}, ${end}) AS chunk FROM attachments WHERE id=${id}`
            ))[0]["chunk"] as Buffer;
    }

    async isReachable(user: UserEntity, id: number): Promise<boolean> {
        const chat = await (await this.attachmentRepository.findByPk(id, {
            include: [{
                model: MessageEntity,
                include: [{
                    model: ChatEntity
                }]
            }]
        })).message.chat;

        return (await chat.$get("members", {where: {id: user.id}})).length > 0;
    }

    async deleteByMessageId(messageId: number) {
        await this.attachmentRepository.destroy({where: {messageId}});
    }
}