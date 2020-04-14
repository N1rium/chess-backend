import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from './user.entity';

@Module({
  imports: [
    JwtModule.register({ secret: 'secret' }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserResolver, UserService],
})
export class UserModule {}
