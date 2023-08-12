import { HttpException, Injectable } from "@nestjs/common";
import admin from "firebase-admin";
import UserEntity from "../users/user.model";
import { InjectModel } from "@nestjs/sequelize";
import FcmTokenEntity from "./fcm-token.model";
import * as process from "process";

@Injectable()
export default class FcmService {
    app: admin.app.App;

    constructor(
        @InjectModel(FcmTokenEntity) private fcmRepository: typeof FcmTokenEntity
    ) {
        this.app = admin.initializeApp({
            credential: admin.credential.cert({
                privateKey: process.env["FCM_PRIVATE_KEY"],
                projectId: process.env["FCM_PROJECT_ID"],
                clientEmail: process.env["FCM_CLIENT_EMAIL"]
            }),
        });
    }

    async registerToken(user: UserEntity, token: string) {
        if (await this.fcmRepository.findByPk(token)) {
            throw new HttpException("Token already registered", 400);
        }
        await this.fcmRepository.create({userId: user.id, token});
    }

    async pushMessage(userId: number, message: {chatName: string, content?: string, attachments?: Express.Multer.File[]}) {
        const tokens = await this.fcmRepository.findAll({where: {userId}});

        try {
            if (tokens.length > 0) {
                this.app.messaging().sendEachForMulticast({
                    data: {
                        title: `From: ${message.chatName}`,
                        content:
                            message.content ||
                            message.attachments &&
                                (message.attachments.length + " attachment" + ((message.attachments.length > 1) ? "s" : "")) ||
                            ""
                    },
                    tokens: tokens.map(t => t.token)
                });
            }
        } catch (e) {
            console.log(e);
        }
    }
}
