import { BeforeCreate, BelongsToMany, Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import * as bcrypt from "bcrypt";
import TokenEntity from "../tokens/tokens.model";
import ChatEntity from "../chats/chat.model";
import ChatUserEntity from "../chat-users/chat-user.model";
import MessageEntity from "../messages/message.model";

export enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN"
}

export type UserCreateType = {
    firstname: string,
    lastname?: string,
    email: string,
    password: string
}

@Table({
    tableName: "users",
    timestamps: true,
    defaultScope: {attributes: {exclude: ["avatar", "password"]}}
})
class UserEntity extends Model<UserEntity, UserCreateType> {

    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    email: string;

    @Column({ type: DataType.ENUM(...Object.values(UserRole)), defaultValue: UserRole.USER })
    role: string;

    @Column({ type: DataType.STRING, allowNull: false })
    firstname: string;

    @Column({ type: DataType.STRING, allowNull: true })
    lastname: string;

    @Column({ type: DataType.STRING, allowNull: false })
    password: string;

    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    isBanned: boolean;

    @HasMany(() => TokenEntity)
    tokens: TokenEntity[];

    @BelongsToMany(() => ChatEntity, { through: () => ChatUserEntity })
    chats: ChatEntity[];

    @HasMany(() => MessageEntity)
    messages: MessageEntity[];

    @Column({ type: DataType.STRING, allowNull: true })
    avatar: string | null;

    @BeforeCreate
    static async beforeCreateHook(instance: UserEntity, options: any): Promise<void> {
        instance.password = await bcrypt.hash(instance.password, 10);
    }

    async compare(password: string): Promise<boolean> {
        const user = this as UserEntity;
        return !!(bcrypt.compareSync(password, user.password));
    }

    get name(): string {
        return this.firstname + " " + this.lastname;
    }
}

export default UserEntity;
