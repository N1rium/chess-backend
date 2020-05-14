import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { Notification } from 'src/notification/notification.entity';

export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  ANON = 'anon',
}

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Field(() => String)
  @Column('varchar', { length: 50 })
  username: string;

  @Column('varchar', { length: 50, unique: true })
  email: string;

  @Column('varchar')
  password: string;

  @Field(() => Number)
  @Column({ type: 'bigint', default: 0 })
  exp: number;

  @Column('varchar', { length: 50, nullable: true })
  salt: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedDate: Date;

  @Field(() => Number)
  @Column({ type: 'integer', default: 1500 })
  classicalElo: number;

  @Field(() => Number)
  @Column({ type: 'integer', default: 1500 })
  rapidElo: number;

  @Field(() => Number)
  @Column({ type: 'integer', default: 1500 })
  blitzElo: number;

  @Field(() => Number)
  @Column({ type: 'integer', default: 1500 })
  bulletElo: number;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', default: null })
  glootId: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', default: null })
  glootToken: string;

  @OneToMany(
    type => Notification,
    noitification => noitification.user,
  )
  notifications: Notification[];

  // @Column({
  //   type: 'enum',
  //   enum: UserRole,
  //   default: UserRole.ANON,
  // })
  // role: UserRole;
}

@InputType()
export class LoginInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}

@ObjectType()
export class LoginResponse {
  @Field(() => User)
  user: User;

  @Field(() => String)
  token: string;
}

@InputType()
export class CreateUserInput {
  @Field(() => String)
  username: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  passwordRepeat: string;
}
