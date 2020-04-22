import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { MatchInvite, MatchInviteSubData } from './match-invite.entity';

@Injectable()
export class MatchInviteService {
  invites: { [key: string]: MatchInvite };

  constructor() {
    this.invites = {};
  }

  async byId(id: string): Promise<MatchInvite> {
    return this.invites[id];
  }

  async getAll(): Promise<MatchInvite[]> {
    return Object.entries(this.invites).map(pair => pair[1]);
  }

  async create(user: User): Promise<MatchInvite> {
    const invites = await this.getAll();
    if (invites.find(i => i.creator.id == user.id))
      throw new BadRequestException({
        message: 'You already have a pending match invite',
      });

    const invite = new MatchInvite();
    const { id } = invite;
    invite.creator = user;
    this.invites[id] = invite;
    return invite;
  }

  async delete(id: string, userId: string): Promise<void> {
    const invite = await this.byId(id);
    const {
      creator: { id: creatorId },
    } = invite;
    if (creatorId !== userId) throw new UnauthorizedException();
    delete this.invites[id];
  }
}
