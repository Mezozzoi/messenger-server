import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/sequelize";
import { accessJwtConfig, refreshJwtConfig } from "src/config/jwt.config";
import { ApiError } from "src/exceptions/validation.exception";
import UserEntity from "../users/user.model";
import TokenDto from "./dto/token.dto";
import TokenEntity from "./tokens.model";
import { Op } from "sequelize";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class UserTokensService {

    constructor(
        @InjectModel(TokenEntity) private tokenRepository: typeof TokenEntity, 
        private jwtService: JwtService
    ) {}

    async addForUser(user: UserEntity) {
        const userDto = new TokenDto(user);

        const tokens = this.generate({...userDto});
        await this.save(userDto.id,tokens.refresh_token);

        return tokens;
    }

    generate(payload: TokenDto){
        const access_token = this.jwtService.sign(payload, accessJwtConfig());
        const refresh_token = this.jwtService.sign(payload, refreshJwtConfig());

        return { access_token, refresh_token }
    }

    async save(userId: number, refreshToken: string){
        const tokenCheck = await this.tokenRepository.findOne({ where: { userId } });
        const expiresAt = new Date(new Date().getTime() + <number>refreshJwtConfig().expiresIn * 1000);
        if (tokenCheck) {
            tokenCheck.refreshToken = refreshToken;
            tokenCheck.expiresAt = new Date();
            return tokenCheck.save();
        }

        return await this.tokenRepository.create({ userId, refreshToken, expiresAt });
    }

    async delete(refreshToken: string){
        return await this.tokenRepository.destroy({ where: { refreshToken } });
    }
    
    verifyRefresh(token: string) {
        try {
            return <TokenDto> this.jwtService.verify(token, { secret: refreshJwtConfig().secret });
        } catch(e) {
            throw ApiError.UnauthorizedError()
        }
    }

    verifyAccess(token: string) {
        try {
            return <TokenDto> this.jwtService.verify(token, { secret: accessJwtConfig().secret });
        } catch(e) {
            throw ApiError.UnauthorizedError()
        }
    }

    findByRefreshToken(refreshToken: string) {
        return this.tokenRepository.findOne({ where: { refreshToken } })
    }

    findByUserId(userId: number) {
        return this.tokenRepository.findOne({ where: { userId } })
    }

    @Cron('0 0 * * * *')
    async deleteExpiredTokens() {
        await this.tokenRepository.destroy({ where: { expiresAt: { [Op.lte]: new Date() } } })
    }
}
