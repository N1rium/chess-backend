import { Injectable } from '@nestjs/common';
import {
  MatchmakingParticipant,
  MatchmakingSearchMode,
} from './matchmaking.entity';
import { MatchService } from 'src/match/match.service';

@Injectable()
export class MatchmakingService {
  participants: { [key: string]: MatchmakingParticipant };
  constructor(private readonly matchService: MatchService) {
    this.participants = {};
  }

  private participantsToArray(): MatchmakingParticipant[] {
    return Object.keys(this.participants).map(key => this.participants[key]);
  }

  async matchmake(userId: string): Promise<string> {
    this.addUserToQueue(userId);
    const search = async (): Promise<string> => {
      console.log('search');
      const player = this.getPlayer(MatchmakingSearchMode.ANY);
      if (player && player.id !== userId) {
        const match = await this.matchService.createMatch(player.id, {
          side: 'w',
          opponent: userId,
        });
        delete this.participants[userId];
        delete this.participants[player.id];
        return match.id;
      }
      setTimeout(() => search(), 1000);
    };
    return search();
  }

  addUserToQueue(userId: string): string {
    const mp = new MatchmakingParticipant(userId);
    this.participants[userId] = mp;
    console.log(this.participants);
    return userId;
  }

  removeUserFromQueue(userId: string): string {
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
