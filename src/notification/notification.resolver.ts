import { Resolver, Query, Subscription, Args } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { Notification } from './notification.entity';
import { CurrentUser } from 'src/core/decorators/current-user';
import { UseGuards, Inject } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth';
import { PubSubEngine } from 'graphql-subscriptions';

@Resolver('Notification')
export class NotificationResolver {
  constructor(
    @Inject('PUB_SUB') private pubSub: PubSubEngine,
    private readonly notificationService: NotificationService,
  ) {}

  @UseGuards(AuthGuard)
  @Query(() => [Notification], { name: 'myNotifications' })
  myNotifications(@CurrentUser() user): Promise<Notification[]> {
    return this.notificationService.byUser(user.id);
  }

  @Subscription(() => Notification, {
    filter: (payload, variables) =>
      payload.notification.userId === variables.userId,
  })
  notification(@Args('userId') userId: string) {
    return this.pubSub.asyncIterator('notification');
  }
}
