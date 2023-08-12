import {
    BeforeCreate, BelongsTo,
    BelongsToMany,
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    Table,
} from "sequelize-typescript";
import UserEntity from "../users/user.model";
import MessageEntity from "../messages/message.model";
import ChatUserEntity from "../chat-users/chat-user.model";
import { Op } from "sequelize";

export enum ChatType {
    DIALOGUE = "DIALOGUE",
    GROUP = "GROUP"
}

export type ChatCreateType = {
    ownerId: number,
    name?: string,
    type: ChatType,
    users?: number[];
}

@Table({
    tableName: "chats",
    timestamps: true,
    indexes: [
        { name: "name_index", fields: ["name"], where: { name: { [Op.ne]: null } } }
    ],
    defaultScope: {attributes: {exclude: ["avatar"]}}
})
class ChatEntity extends Model<ChatEntity, ChatCreateType> {
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataType.STRING, allowNull: true })
    name: string | null;

    @Column({ type: DataType.STRING, allowNull: true })
    avatar: string | null;

    @Column({type: DataType.STRING, allowNull: false})
    type: ChatType;

    @ForeignKey(() => UserEntity)
    @Column({type: DataType.INTEGER, allowNull: false})
    ownerId: number;

    @BelongsTo(() => UserEntity)
    owner: UserEntity;

    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    isBanned: boolean;

    @BelongsToMany(() => UserEntity, { through: () => ChatUserEntity })
    members: UserEntity[];

    @HasMany(() => MessageEntity)
    messages: MessageEntity[];

    @BeforeCreate
    static async beforeCreateHook(instance: ChatEntity, options: any): Promise<void> {
        switch (instance.type) {
            case ChatType.DIALOGUE:
                instance.name = null;
            break;
        }
    }
}

export default ChatEntity;