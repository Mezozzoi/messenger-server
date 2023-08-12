import { forwardRef, Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import AttachmentEntity from "./attachment.model";
import AttachmentsService from "./attachments.service";
import AttachmentsController from "./attachments.controller";
import { TokensModule } from "../tokens/tokens.module";
import { UsersModule } from "../users/users.module";
import S3Module from "../s3/s3.module";

@Module({
    controllers: [AttachmentsController],
    providers: [AttachmentsService],
    imports: [
        SequelizeModule.forFeature([AttachmentEntity]),
        forwardRef(() => UsersModule),
        TokensModule,
        S3Module
    ],
    exports: [
        AttachmentsService,
    ],
})
export default class AttachmentsModule {
}