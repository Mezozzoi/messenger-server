import { HttpException, HttpStatus } from "@nestjs/common";

class UnauthorizedException extends HttpException {

    constructor() {
        super("Unauthorized error", HttpStatus.UNAUTHORIZED)
    }
}

export default UnauthorizedException;