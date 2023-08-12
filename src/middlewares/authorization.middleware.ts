import { ExtendedError } from "socket.io/dist/namespace";
import { ApiError } from "src/exceptions/validation.exception";
import { UserTokensService } from "src/modules/tokens/tokens.service";
import { SocketMiddleware } from "./socket-middleware";
import AppSocket from "../common/types/socket";

class AuthorizationMiddleware implements SocketMiddleware {

    constructor(private userTokenService: UserTokensService) {}


    async handle(socket: AppSocket, next: (err?: ExtendedError) => void) {
        try {
            const bearerToken = socket.handshake.auth && socket.handshake.auth.token;
            if(!bearerToken) throw ApiError.UnauthorizedError()

            const userData = this.userTokenService.verifyAccess(bearerToken);
            if(!bearerToken || !userData) throw ApiError.UnauthorizedError();

            const token = userData.id && await this.userTokenService.findByUserId(userData.id);
            if(!token)  throw ApiError.UnauthorizedError();
            
            const user = await token.$get("user")

            socket.data.user = user;
            socket.data.userId = user.id;

            next();
        } catch(e: any) {
            next(e);
        }
    }
}

export default AuthorizationMiddleware;