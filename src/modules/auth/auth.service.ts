import { Injectable } from "@nestjs/common";
import ValidationException from 'src/exceptions/validation.exception';
import { UserTokensService } from '../tokens/tokens.service';
import UserCreateDto from '../users/dtos/user-create.dto';
import { UsersService } from '../users/users.service';
import LoginDto from './dtos/login-dto';
import UserEntity from "../users/user.model";

@Injectable()
export class AuthService {

    constructor(
        private userService: UsersService,
        private userJwtService: UserTokensService
    ) {}

    async register(userCreateDto: UserCreateDto) {
        const { email } = userCreateDto;
        const user = await this.userService.findByEmail(email);
        if (user) throw new ValidationException("User is already exists");

        const newUser = await this.userService.create(userCreateDto);
        const tokens = await this.userJwtService.addForUser(newUser);

        return {...tokens, user: newUser};
    }
    
    async auth({ email, password }: LoginDto): Promise<{ access_token: string, refresh_token: string, user: UserEntity }> {
        const user = await this.userService.findByEmail(email, {password: true});
        if(!user) throw new ValidationException("Invalid email or password");
        
        const isPasswordValid = await user.compare(password);
        if(!isPasswordValid) throw new ValidationException("Invalid email or password");

        const tokens = await this.userJwtService.addForUser(user);

        delete user.password;

        return {
            ...tokens,
            user
        }
    }

    async logout(refreshToken: string | undefined) {
        if(!refreshToken) throw new ValidationException("Undefined token");

        const token = await this.userJwtService.delete(refreshToken);
        return token;
    }

    async refresh(refreshToken: string | undefined){
        if(!refreshToken) throw new ValidationException("Undefined token");

        const tokenPayload = this.userJwtService.verifyRefresh(refreshToken);
        const checkToken = this.userJwtService.findByRefreshToken(refreshToken);

        if(!checkToken || !tokenPayload) throw new ValidationException("Undefined token");

        const user = await this.userService.findById(tokenPayload.id)
        if(!user) throw new ValidationException("User not found");
        const tokens = await this.userJwtService.addForUser(user);

        return {...tokens, user};
    }
}
