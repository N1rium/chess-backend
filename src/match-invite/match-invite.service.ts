import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { MatchInvite } from './match-invite.entity';

@Injectable()
export class MatchInviteService {
  invites: { [key: string]: MatchInvite };

  constructor() {
    this.invites = {};
  }

  invitesToArray() {
    return Object.keys(this.invites).map(key => this.invites[key]);
  }

  async byId(id: string): Promise<MatchInvite> {
    const invite = this.invites[id];
    if (!invite) throw new NotFoundException();
    return invite;
  }

  async getAll(): Promise<MatchInvite[]> {
    return Object.entries(this.invites).map(pair => pair[1]);
  }

  async findByUser(user: User): Promise<MatchInvite> {
    const invite = Object.entries(this.invites)
      .map(pair => pair[1])
      .find(invite => invite.creator.id == user.id);
    if (!invite) throw new NotFoundException();
    return invite;
  }

  async create(user: User): Promise<MatchInvite> {
    const storedInvite = this.invitesToArray().find(
      invite => invite.creator.id == user.id,
    );
    if (storedInvite)
      throw new BadRequestException({
        message: 'You can only have one match invite active',
      });
    const invite = new MatchInvite();
    const { id } = invite;
    invite.creator = user;
    this.invites[id] = invite;
    return invite;
  }

  async delete(id: string): Promise<MatchInvite> {
    const invite = await this.byId(id);
    delete this.invites[invite.id];
    return invite;
  }

  async deleteUserInvite(user: User): Promise<MatchInvite> {
    const invite = await this.findByUser(user);
    const {
      creator: { id: creatorId },
    } = invite;
    if (creatorId !== user.id) throw new UnauthorizedException();
    return this.delete(invite.id);
  }
}
