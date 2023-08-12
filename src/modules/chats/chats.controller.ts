import {
    Body,
    Controller,
    Delete, FileTypeValidator,
    Get, MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    Post,
    Query,
    Req, Res, StreamableFile,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { Auth } from "../../common/decorators/auth.decorator";
import { ChatsService } from "./chats.service";
import { Request, Response } from "express";
import GroupChatCreateDto from "./dtos/group-chat-create.dto";
import ChatModel from "./chat.model";
import { FileInterceptor } from "@nestjs/platform-express";
import FilenamePipe from "../../pipes/filename.pipe";
import EditChatDto from "./dtos/edit-chat.dto";
import ChatEntity from "./chat.model";
import UserEntity from "../users/user.model";
import DialogueChatCreateDto from "./dtos/dialogue-chat-create.dto";

@Controller('chats')
export class ChatsController {
    constructor(private chatsService: ChatsService) {}

    @Auth()
    @Get("/joined")
    async getJoined(@Req() req: Request): Promise<ChatModel[]> {
        return await this.chatsService.findAllByMember(req.user.id);
    }

    @Auth()
    @Get("/search")
    async search(
        @Query("name") query: string,
        @Req() req: Request
    ): Promise<{ chats: ChatModel[], users: UserEntity[] }> {
        return await this.chatsService.search(req.user, query);
    }

    @Auth()
    @Get("/:chatId")
    async getChat(@Param("chatId") chatId: string): Promise<Pick<ChatModel, "id" | "type" | "name">> {
        return await this.chatsService.findById(+chatId);
    }

    @Auth()
    @Post("/createGroup")
    async createGroup(@Req() req: Request, @Body() groupChatCreateDto: GroupChatCreateDto): Promise<{chatId: number}> {
        return { chatId: (await this.chatsService.createGroup(req.user, { ownerId: req.user.id, ...groupChatCreateDto })).id };
    }

    @Auth()
    @Post("/createDialogue")
    async createDialogue(@Req() req: Request, @Body() dialogueChatCreateDto: DialogueChatCreateDto): Promise<{chatId: number}> {
        return { chatId: (await this.chatsService.createDialogue(req.user, dialogueChatCreateDto.participant)).id };
    }

    @Auth()
    @Post("/join")
    async join(@Req() req: Request, @Body("chatId") chatId: number): Promise<void> {
        await this.chatsService.join(req.user.id, chatId);
    }

    @Auth()
    @Post("/leave")
    async leave(@Req() req: Request, @Body("chatId") chatId: number): Promise<{chatId: number}> {
        return await this.chatsService.leave(req.user, chatId);
    }

    @Auth()
    @Delete("/:chatId")
    async delete(@Req() req: Request, @Param("chatId") chatId: number): Promise<{chatId: number}> {
        return await this.chatsService.delete(req.user, chatId);
    }

    @Auth()
    @Post("/edit/:chatId")
    @UseInterceptors(FileInterceptor("avatar", {}))
    async editAvatar(
        @Body() editChatDto: EditChatDto,
        @Param("chatId") chatId: number,
        @UploadedFile(new ParseFilePipe({
            fileIsRequired: false,
            validators: [
                new MaxFileSizeValidator({maxSize: 20 * 1024 * 1024}),
                new FileTypeValidator({fileType: /image\/(jpg|jpeg|png)/})
            ]
        }), FilenamePipe) avatar: Express.Multer.File,
        @Req() req: Request,
    ): Promise<ChatEntity | null> {
        if (avatar) editChatDto.avatar = avatar;

        return await this.chatsService.editChat(req.user, chatId, editChatDto);
    }

    @Auth()
    @Get("/avatar/:chatId")
    async getAvatar(
        @Param("chatId") chatId: number,
        @Res({passthrough: true}) res: Response,
        @Req() req: Request
    ) {
        const avatar = await this.chatsService.getAvatar(req.user, chatId);

        if (!avatar) return null;

        res.set({
            "Content-Type": "image/jpeg"
        });

        return new StreamableFile(avatar);
    }
}
