import {
    Body,
    Controller, Delete,
    Get, MaxFileSizeValidator,
    Param, ParseFilePipe,
    Post,
    Query,
    Req,
    UploadedFiles,
    UseInterceptors,
} from "@nestjs/common";
import MessageSendDto from "./dtos/message-send.dto";
import { MessagesService } from "./messages.service";
import { Auth } from "../../common/decorators/auth.decorator";
import { Request } from "express";
import { FilesInterceptor } from "@nestjs/platform-express";
import MessageModel from "./message.model";
import FilenamePipe from "../../pipes/filename.pipe";
import EditMessageDto from "./dtos/edit-message.dto";

@Controller("messages")
export default class MessagesController {
    constructor(private messagesService: MessagesService) {
    }

    @Auth()
    @Post("/send")
    @UseInterceptors(FilesInterceptor("attachments", 10, {}))
    async sendMessage(@Req() req: Request,
                      @UploadedFiles(new ParseFilePipe({
                          fileIsRequired: false,
                          validators: [
                              new MaxFileSizeValidator({maxSize: 100 * 1024 * 1024})
                          ]
                      }), FilenamePipe) attachments: Express.Multer.File[],
                      @Body() messageSendDto: MessageSendDto) {
        return await this.messagesService.sendMessage(req.user, messageSendDto.chatId, messageSendDto.content, attachments);
    }

    @Auth()
    @Get("/:chatId")
    async getMessages(@Req() req: Request,
                      @Param("chatId") chatId: number,
                      @Query("offset") offset: number,
                      @Query("limit") limit: number) {
        if (limit > 50 || !limit) limit = 50;
        if (!offset) offset = 0;
        return await this.messagesService.getFromChat(req.user, chatId, { offset, limit });
    }

    @Auth()
    @Get("/:chatId/last")
    async getLastMessage(@Req() req: Request,
                         @Param("chatId") chatId: number): Promise<{ chatId: number, message: MessageModel }> {
        return { chatId, message: await this.messagesService.getLastMessage(req.user, chatId) };
    }

    @Auth()
    @Delete("/:messageId")
    async deleteMessage(@Req() req: Request,
                        @Param("messageId") messageId: number) {
        await this.messagesService.deleteMessage(req.user, messageId);
    }

    @Auth()
    @Post("/edit")
    @UseInterceptors(FilesInterceptor("attachments", 10, {}))
    async editMessage(@Req() req: Request,
                      @UploadedFiles(new ParseFilePipe({
                          fileIsRequired: false,
                          validators: [
                              new MaxFileSizeValidator({maxSize: 100 * 1024 * 1024})
                          ]
                      }), FilenamePipe) attachments: Express.Multer.File[],
                      @Body() editMessageDto: EditMessageDto) {
        await this.messagesService.editMessage(req.user, editMessageDto);
    }
}