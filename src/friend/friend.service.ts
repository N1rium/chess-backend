import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Friend, Relationship } from './friend.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
  ) {}

  async userFriends(id: string): Promise<Friend[]> {
    return this.friendRepository.find({
      relations: ['user', 'friend'],
      where: [
        { status: Relationship.MUTUAL, user: { id } },
        { status: Relationship.MUTUAL, friend: { id } },
      ],
    });
  }

  async sendFriendRequest(sender: string, recipient: string): Promise<Friend> {
    if (!sender.toString() || !recipient.toString())
      throw new BadRequestException({ message: 'Missing parameters' });
    if (sender == recipient)
      throw new BadRequestException({ message: 'Cannot add self as friend' });
    const stored = await this.friendRepository.findOne({
      where: [{ user: { id: sender } }, { friend: { id: recipient } }],
    });

    if (!stored) {
      return this.friendRepository.save({
        user: { id: sender },
        friend: { id: recipient },
        status: Relationship.PENDING,
      });
    }

    return stored;
  }
}
