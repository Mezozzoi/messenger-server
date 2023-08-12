import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import TokenEntity from './tokens.model';
import { UserTokensService } from './tokens.service';
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  providers: [UserTokensService],
  imports: [
    SequelizeModule.forFeature([ TokenEntity ]),
    JwtModule.register({}),
    ScheduleModule.forRoot()
  ],
  exports: [ 
    UserTokensService
  ]
})
export class TokensModule {}