import { Catch, ArgumentsHost, InternalServerErrorException } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ApiError } from 'src/exceptions/validation.exception';

@Catch()
export class SocketExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const socket: Socket = host.switchToWs().getClient();

    console.log(exception)
    if (exception instanceof ApiError) {
      socket.emit('exception', exception.getResponse());
      return;
    }

    const internalError = new InternalServerErrorException();
    socket.emit("exception", internalError.getResponse());
  }
}