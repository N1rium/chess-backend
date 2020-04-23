import { Resolver, Mutation, Query, Args, Subscription } from '@nestjs/graphql';
import { MatchInviteService } from './match-invite.service';
import { CurrentUser } from 'src/core/decorators/current-user';
import { MatchInvite, MatchInviteSubData } from './match-invite.entity';
import { PubSub } from 'graphql-subscriptions';
import { User } from 'src/user/user.entity';

const pubSub = new PubSub();

@Resolver('MatchInvite')
export class MatchInviteResolver {
  constructor(private readonly matchInviteService: MatchInviteService) {}

  @Query(() => MatchInvite, { name: 'matchInviteFromId' })
  matchInviteFromId(
    @Args('id', { type: () => String }) id: string,
  ): Promise<MatchInvite> {
    return this.matchInviteService.byId(id);
  }

  @Query(() => [MatchInvite], { name: 'matchInvites' })
  matchInvites(): Promise<MatchInvite[]> {
    return this.matchInviteService.getAll();
  }

  @Mutation(() => MatchInvite, { name: 'createMatchInvite' })
  async createMatchInvite(@CurrentUser() user): Promise<MatchInvite> {
    const invite = await this.matchInviteService.create(user);
    pubSub.publish('matchInvite', {
      matchInvite: { invite },
    });
    return invite;
  }

  @Mutation(() => MatchInvite, { name: 'deleteMyInvite' })
  async deleteMyInvite(@CurrentUser() user: User): Promise<MatchInvite> {
    const invite = await this.matchInviteService.deleteUserInvite(user);
    pubSub.publish('matchInvite', {
      matchInvite: { invite, deleted: true },
    });
    return invite;
  }

  @Subscription(() => MatchInviteSubData)
  matchInvite() {
    return pubSub.asyncIterator('matchInvite');
  }
}
