import { Module } from '@nestjs/common';
import { FriendResolver } from './friend.resolver';
import { FriendService } from './friend.service';

@Module({
  providers: [FriendResolver, FriendService]
})
export class FriendModule {}
