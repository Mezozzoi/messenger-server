import { BadRequestException, forwardRef, HttpException, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/sequelize';
import UserCreateDto from './dtos/user-create.dto';
import UserEntity from './user.model';
import ChangePasswordDto from "./dtos/change-password.dto";
import * as bcrypt from "bcrypt";
import EditProfileDto from "./dtos/editProfileDto";
import S3Service from "../s3/s3.service";
import * as crypto from "crypto";
import { EventsGateway } from "../events/events.gateway";

@Injectable()
export class UsersService {

    constructor(
        @InjectModel(UserEntity) private userRepository: typeof UserEntity,
        private s3Service: S3Service,
        @Inject(forwardRef(() => EventsGateway)) private eventsGateway: EventsGateway
        ) {}

    async create(userCreateDto: UserCreateDto): Promise<UserEntity> {
        return this.userRepository.create(userCreateDto);
    }

    findById(id: number): Promise<UserEntity> {
        return this.userRepository.findOne({ where: { id } });
    }

    findByEmail(email: string, options?: {password?: boolean}): Promise<UserEntity> {
        return this.userRepository.findOne({ where: { email }, attributes: {include: [...(options ? ["password"] : [])]} });
    }

    async changePassword(user: UserEntity, {oldPassword, newPassword}: ChangePasswordDto): Promise<UserEntity> {
        user = await this.userRepository.findByPk(user.id, {attributes: {include: ["password"]}});

        if (!await user.compare(oldPassword)) throw new BadRequestException("Invalid old password");

        return await user.update({ password: bcrypt.hashSync(newPassword, 10) });
    }

    async isModified(userId: number, date: number): Promise<boolean> {
        const user = await this.userRepository.findByPk(userId, {attributes: ["updatedAt"]})

        if (!user) throw new HttpException("No user found.", 404);

        console.log(date, new Date(user.updatedAt).getTime());
        return new Date(user.updatedAt).getTime() > date
    }

    async getAvatar(user: UserEntity, userId: number): Promise<{avatar: Buffer, updatedAt: number}> {
        const _user = await this.userRepository.findByPk(userId, {attributes: ["avatar", "updatedAt"]});

        if (!_user) throw new HttpException("No user found.", 404);

        const avatarKey = _user.avatar;
        const avatar = await this.s3Service.getUserAvatar(avatarKey);

        return avatar && {
            avatar,
            updatedAt: _user.updatedAt
        };
    }

    async editProfile(user: UserEntity, editOptions: EditProfileDto): Promise<UserEntity> {
        const key = crypto.randomUUID();


        if (editOptions.avatar) {
            await this.s3Service.uploadUserAvatar(key, editOptions.avatar.buffer);
            await user.update({
                avatar: key
            });
        }
        await user.update({
            firstname: editOptions?.firstname,
            lastname: editOptions?.lastname,
        });

        await this.eventsGateway.emitUserEdited(user, !!editOptions.avatar);

        return user;
    }
}
