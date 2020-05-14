import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Field, ID, registerEnumType, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/user.entity';
import JSON from 'graphql-type-json';

export enum NotificationType {
  OTHER = 'OTHER',
  MATCH_ENDED = 'MATCH_ENDED',
}

registerEnumType(NotificationType, { name: 'NotificationType' });

@Entity()
@ObjectType()
export class Notification {
  @Field(() => ID)
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Field(() => Boolean)
  @Column({ type: 'boolean' })
  read: boolean;

  @Field(() => NotificationType)
  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.OTHER,
  })
  type: NotificationType;

  @Field(() => JSON, { defaultValue: {} })
  @Column({ type: 'json' })
  data: any;

  @ManyToOne(
    type => User,
    user => user.notifications,
  )
  user: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedDate: Date;
}
