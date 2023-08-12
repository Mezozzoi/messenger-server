import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    Table,
} from "sequelize-typescript";
import UserEntity from "../users/user.model";
import AttachmentEntity from "../attachments/attachment.model";
import ChatEntity from "../chats/chat.model";

export type MessageCreateType = {
    ownerId: number,
    chatId: number,
    content?: string
}

@Table({
    tableName: "messages",
    timestamps: true
})
class MessageEntity extends Model<MessageEntity, MessageCreateType> {

    @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataType.STRING(500), allowNull: true })
    content?: string;

    @HasMany(() => AttachmentEntity)
    attachments: AttachmentEntity[];

    @ForeignKey(() => UserEntity)
    @Column({ type: DataType.INTEGER, allowNull: false })
    ownerId: number;

    @BelongsTo(() => UserEntity)
    owner: UserEntity;

    @ForeignKey(() => ChatEntity)
    @Column({ type: DataType.INTEGER, allowNull: false })
    chatId: number;

    @BelongsTo(() => ChatEntity)
    chat: ChatEntity;
}

export default MessageEntity;