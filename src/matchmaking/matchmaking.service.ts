import { Injectable, Inject, HttpService } from '@nestjs/common';
import {
  MatchmakingParticipant,
  MatchmakingSearchMode,
} from './matchmaking.entity';
import { MatchService } from 'src/match/match.service';
import { PubSubEngine } from 'graphql-subscriptions';

@Injectable()
export class MatchmakingService {
  participants: { [key: string]: MatchmakingParticipant };
  constructor(
    private readonly matchService: MatchService,
    @Inject('PUB_SUB') private pubSub: PubSubEngine,
  ) {
    this.participants = {};
  }

  private participantsToArray(): MatchmakingParticipant[] {
    return Object.keys(this.participants).map(key => this.participants[key]);
  }

  async matchmake(userId: string): Promise<string> {
    const player = this.getPlayer(MatchmakingSearchMode.ANY);
    if (player && player.id !== userId) {
      const match = await this.matchService.createMatch(player.id, {
        side: 'w',
        opponent: userId,
        timeControl: 5,
        increment: 0,
        rated: true,
      });

      this.removeUsersFromQueue([userId, player.id]);
      this.pubSub.publish('matchmake', {
        matchmake: {
          userIds: [userId.toString(), player.id.toString()],
          matchId: match.id,
        },
      });
      return match.id;
    }
    return null;
  }

  async addUserToQueue(userId: string): Promise<string> {
    const mm = await this.matchmake(userId);
    if (mm) return mm;
    const mp = new MatchmakingParticipant(userId);
    this.participants[userId] = mp;
    return userId;
  }

  async removeUsersFromQueue(userIds: string[]): Promise<boolean> {
    await userIds.forEach(id => this.removeUserFromQueue(id));
    return true;
  }

  async removeUserFromQueue(userId: string): Promise<string> {
    delete this.participants[userId];
    console.log(this.participants);
    return userId;
  }

  getPlayer(mode: MatchmakingSearchMode): MatchmakingParticipant {
    if (mode === MatchmakingSearchMode.ANY) {
      return this.participantsToArray()[0];
    }

    return null;
  }
}
