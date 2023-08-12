import { ValidationPipe } from "@nestjs/common";
import { ValidationError } from "class-validator";
import { ApiError } from "src/exceptions/validation.exception";

class Validation extends ValidationPipe {
    constructor() {
        super({
            transform: true,
            transformOptions: {enableImplicitConversion: true},
            forbidNonWhitelisted: true,
            exceptionFactory: (validationErrors: ValidationError[] = []) => {
                const messages = validationErrors.map((error) => 
                    error.constraints ? { [error.property]: Object.values(error.constraints)[0] } : error.toString()
                )
                throw ApiError.BadRequest("Validation error", messages);
            },
        })
    }
}

export default Validation;