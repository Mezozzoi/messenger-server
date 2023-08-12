import { INestApplicationContext } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { Server } from "socket.io";
import AuthorizationMiddleware from "src/middlewares/authorization.middleware";
import { UserTokensService } from "src/modules/tokens/tokens.service";

export class AuthorizationIoAdapter extends IoAdapter {
    constructor(
        private app: INestApplicationContext,
        private path: string
    ) {
        super(app);
    }

    createIOServer(port: number, options?: any) {
        const userTokenService = this.app.get(UserTokensService);
        const server: Server = super.createIOServer(port, { ...options, path: this.path });
        const authSocketMiddleware = new AuthorizationMiddleware(userTokenService);

        server.use(authSocketMiddleware.handle.bind(authSocketMiddleware));

        return server;
    }
}