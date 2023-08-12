import {
    Body,
    Controller,
    FileTypeValidator,
    Get,
    Headers,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    Post,
    Req,
    Res,
    StreamableFile,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import ChangePasswordDto from "./dtos/change-password.dto";
import { Auth } from "../../common/decorators/auth.decorator";
import { Request, Response } from "express";
import UserEntity from "./user.model";
import { FileInterceptor } from "@nestjs/platform-express";
import FilenamePipe from "../../pipes/filename.pipe";
import EditProfileDto from "./dtos/editProfileDto";

@Controller("users")
export class UsersController {

    constructor(private userService: UsersService) {
    }

    @Auth()
    @Post("/password/change")
    async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req: Request) {
        return await this.userService.changePassword(req.user, changePasswordDto);
    }

    @Auth()
    @Get("/:userId")
    async getByUserId(@Param("userId") userId: number) {
        return await this.userService.findById(userId);
    }

    @Auth()
    @Get("/avatar/:userId")
    async getAvatar(
        @Param("userId") userId: number,
        @Res({passthrough: true}) res: Response,
        @Req() req: Request,
        @Headers("if-modified-since") cacheDate: string,
    ) {
        // if (cacheDate && !await this.userService.isModified(userId, new Date(cacheDate).getTime())) {
        //
        //     return res.sendStatus(304);
        // }

        const result = await this.userService.getAvatar(req.user, userId);

        if (!result) return null;

        res.set({
            "Last-Modified": new Date(result.updatedAt).toUTCString(),
            "Content-Type": "image/jpeg",
        });

        return new StreamableFile(result.avatar);
    }

    @Auth()
    @Post("/profile/edit")
    @UseInterceptors(FileInterceptor("avatar"))
    async editAvatar(
        @Body() editProfileDto: EditProfileDto,
        @UploadedFile(new ParseFilePipe({
            fileIsRequired: false,
            validators: [
                new FileTypeValidator({ fileType: /image\/(jpg|jpeg|png)/ }),
                new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }),
            ],
        }), FilenamePipe) avatar: Express.Multer.File,
        @Req() req: Request,
    ): Promise<UserEntity | null> {
        if (avatar) editProfileDto.avatar = avatar;

        return await this.userService.editProfile(req.user, editProfileDto);
    }
}
