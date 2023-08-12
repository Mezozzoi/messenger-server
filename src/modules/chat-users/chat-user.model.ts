import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import UserEntity from "../users/user.model";
import ChatEntity from "../chats/chat.model";

export type ChatUserCreateType = {
    chatId: number,
    userId: number
}

@Table({
    tableName: "chat_user",
    timestamps: true
})
export default class ChatUserEntity extends Model<ChatUserEntity, ChatUserCreateType> {
    @ForeignKey(() => ChatEntity)
    @Column({ type: DataType.INTEGER, primaryKey: true })
    chatId: number;

    @BelongsTo(() => ChatEntity)
    chat: ChatEntity;

    @ForeignKey(() => UserEntity)
    @Column({ type: DataType.INTEGER, primaryKey: true })
    userId: number;

    @BelongsTo(() => UserEntity)
    user: UserEntity;
}