import { BadRequestException, HttpException, HttpStatus } from "@nestjs/common";

class ValidationException extends BadRequestException {

    constructor(response) {
        super(response, { cause: new Error(), description: 'Bad Request' });
    }
}

export default ValidationException;

export class ApiError extends HttpException {
    public errors: Array<any>

    constructor(status: HttpStatus, message: string, errors:Array<any> = []) {
        super({ status, message,errors }, status)
        this.errors = errors;
    }

    static UnauthorizedError() {
        return new ApiError(HttpStatus.UNAUTHORIZED, 'Unauthorized error')
    }

    static PermissionDenied() {
        return new ApiError(HttpStatus.FORBIDDEN, "Permission denied");
    }

    static BadRequest(message: string, errors:Array<any> = []) {
        return new ApiError(HttpStatus.BAD_REQUEST, message , errors);
    }
}
