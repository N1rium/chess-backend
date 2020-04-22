import { Module } from '@nestjs/common';
import { MatchInviteResolver } from './match-invite.resolver';
import { MatchInviteService } from './match-invite.service';

@Module({
  providers: [MatchInviteResolver, MatchInviteService]
})
export class MatchInviteModule {}
