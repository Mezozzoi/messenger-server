import { Controller, Get, Headers, Param, Req, Res, StreamableFile } from "@nestjs/common";
import AttachmentsService from "./attachments.service";
import { Auth } from "../../common/decorators/auth.decorator";
import { Request, Response } from "express";

@Controller("attachments")
export default class AttachmentsController {
    constructor(private attachmentsService: AttachmentsService) {
    }

    @Auth()
    @Get("/video/:id")
    async getVideo(
        @Req() req: Request,
        @Param("id") id: number,
        @Res({ passthrough: true }) res: Response,
        @Headers() {range}: {range: string}
    ): Promise<void> {
        if (!range) {
            res.status(400).send("Requires Range header");
        }

        const attachment = await this.attachmentsService.getById(req.user, id);
        const videoSize = attachment.size;
        const CHUNK_SIZE = 10 ** 6;
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        const contentLength = end - start + 1;

        res.set({
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        });

        res.status(206);
        const videoStream = await this.attachmentsService.getChunk(req.user, id, start, end);
        res.send(videoStream);
    }

    @Auth()
    @Get("/:id")
    async getAttachment(
        @Req() req: Request,
        @Param("id") id: number
    ) {
        const attachment = await this.attachmentsService.getById(req.user, id);
        const file = await this.attachmentsService.getFile(attachment.key);

        return new StreamableFile(file, {
            type: attachment.mime,
            disposition: encodeURI(attachment.filename)
        })
    }
}