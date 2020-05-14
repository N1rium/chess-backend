import { Module } from '@nestjs/common';
import { FriendResolver } from './friend.resolver';
import { FriendService } from './friend.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from './friend.entity';
import { User } from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Friend, User])],
  providers: [FriendResolver, FriendService],
})
export class FriendModule {}
