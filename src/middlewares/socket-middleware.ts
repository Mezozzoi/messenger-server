import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";

export interface SocketMiddleware {
    handle: (socket: Socket, next: (err?: ExtendedError | undefined) => void) => Promise<void>;
}