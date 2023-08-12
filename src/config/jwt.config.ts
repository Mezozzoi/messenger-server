import { JwtSignOptions } from "@nestjs/jwt";

export const accessJwtConfig = (): JwtSignOptions => ({
    secret: process.env.JWT_ACCESS_CODE,
    expiresIn: 30*60
})

export const refreshJwtConfig = (): JwtSignOptions => ({
    secret: process.env.JWT_REFRESH_CODE,
    expiresIn: 30*24*60*60
})