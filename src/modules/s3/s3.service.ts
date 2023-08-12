import { Injectable } from "@nestjs/common";
import { NoSuchKey, S3, S3ServiceException } from "@aws-sdk/client-s3";
import * as process from "process";

@Injectable()
class S3Service {
    s3 = new S3({
        region: process.env["AWS_REGION"],
        credentials: {
            accessKeyId: process.env["AWS_ACCESS_KEY"],
            secretAccessKey: process.env["AWS_SECRET_KEY"]
        }
    })

    private async getObject(key: string): Promise<Buffer | undefined> {
        try {
            const response = await this.s3.getObject({Bucket: process.env["AWS_BUCKET"], Key: key});
            return Buffer.from(await response.Body.transformToByteArray());
        } catch (e) {
            if ((e as S3ServiceException).name === NoSuchKey.name)
                return undefined;
            throw e;
        }
    }

    private async uploadObject(key: string, body: ReadableStream<any> | string | Uint8Array | Buffer) {
        return this.s3.putObject({Bucket: process.env["AWS_BUCKET"], Key: key, Body: body});
    }

    async getAttachment(key: string) {
        return this.getObject(`attachments/${key}`);
    }

    async uploadAttachment(key: string, buffer: Buffer) {
        return this.uploadObject(`attachments/${key}`, buffer);
    }

    async getUserAvatar(key: string): Promise<Buffer | undefined> {
        return this.getObject(`users-avatars/${key}`);
    }

    async uploadUserAvatar(key: string, buffer: Buffer) {
        return this.uploadObject(`users-avatars/${key}`, buffer);
    }

    async getChatAvatar(key: string): Promise<Buffer | undefined> {
        return this.getObject(`chats-avatars/${key}`);
    }

    async uploadChatAvatar(key: string, buffer: Buffer) {
        return this.uploadObject(`chats-avatars/${key}`, buffer);
    }
}

export default S3Service;