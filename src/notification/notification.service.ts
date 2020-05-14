import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
import { User } from 'src/user/user.entity';
import { PubSubEngine } from 'graphql-subscriptions';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('PUB_SUB') private pubSub: PubSubEngine,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  /* ================================= READ ================================== */

  async byId(userId: string, notificationId: string): Promise<Notification> {
    const stored = await this.notificationRepository.findOne({
      id: notificationId,
    });

    if (!stored)
      throw new NotFoundException({ message: 'No such notification' });
    if (stored.user.id !== userId) throw new ForbiddenException();

    return stored;
  }

  async byUser(id: string, take = 10, skip = 0): Promise<Notification[]> {
    return this.notificationRepository.find({
      take,
      skip,
      where: { user: { id } },
    });
  }

  /* ================================= WRITE ================================== */

  async create(
    userId: string,
    read: boolean,
    data = {},
    type = NotificationType.OTHER,
  ): Promise<Notification> {
    const notification = new Notification();
    notification.user = new User();
    notification.user.id = userId;
    notification.read = read;
    notification.data = data;
    notification.type = type;
    return this.notificationRepository.save(notification);
  }

  /* ================================= UPDATE ================================= */

  async read(userId: string, notificationId: string): Promise<Notification> {
    const stored = await this.byId(userId, notificationId);
    stored.read = true;
    return this.notificationRepository.save(stored);
  }

  /* ================================= DELETE ================================= */

  async delete(userId: string, notificationId: string): Promise<boolean> {
    const stored = await this.byId(userId, notificationId);
    try {
      await this.notificationRepository.delete(stored.id);
    } catch {
      return false;
    }
    return true;
  }
}
