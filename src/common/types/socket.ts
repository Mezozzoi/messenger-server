import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SocketData } from "./socket-data";

type AppSocket = Socket<DefaultEventsMap, any, DefaultEventsMap, SocketData>;

export default AppSocket;