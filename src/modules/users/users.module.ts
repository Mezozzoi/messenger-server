import { forwardRef, Module } from "@nestjs/common";
import { SequelizeModule } from '@nestjs/sequelize';
import UserEntity from './user.model';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TokensModule } from "../tokens/tokens.module";
import S3Module from "../s3/s3.module";
import { EventsModule } from "../events/events.module";

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    imports: [
        SequelizeModule.forFeature([ UserEntity ]),
        TokensModule,
        S3Module,
        forwardRef(() => EventsModule)
    ],
    exports: [
        UsersService
    ]
})
export class UsersModule {}
