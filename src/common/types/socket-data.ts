import UserEntity from "src/modules/users/user.model"
import { Socket } from 'socket.io'

// Declares user in socket data
export interface SocketData extends Socket {
    user: UserEntity,
    userId: number
}