import { SequelizeModuleOptions } from "@nestjs/sequelize";
import TokenEntity from "src/modules/tokens/tokens.model";
import UserEntity from "src/modules/users/user.model";
import AttachmentEntity from "../modules/attachments/attachment.model";
import ChatEntity from "../modules/chats/chat.model";
import MessageEntity from "../modules/messages/message.model";
import ChatUserEntity from "../modules/chat-users/chat-user.model";

const databaseConfig = (): SequelizeModuleOptions => ({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    models: [
        UserEntity,
        TokenEntity,
        ChatEntity,
        MessageEntity,
        AttachmentEntity,
        ChatUserEntity
    ],
    autoLoadModels: true,
    logging: false,
    benchmark: true,
    synchronize: true,
})

export default databaseConfig;