import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import {
  User,
  LoginInput,
  LoginResponse,
  CreateUserInput,
} from './user.entity';
import { CurrentUser } from 'src/core/decorators/current-user';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, { name: 'userById' })
  userById(@Args('id') id: string): Promise<User> {
    return this.userService.userById(id);
  }

  @Query(() => User, { name: 'userByEmail' })
  userByEmail(@Args('email') email: string): Promise<User> {
    return this.userService.userByEmail(email);
  }

  @UseGuards(AuthGuard)
  @Query(() => User, { name: 'me' })
  me(@CurrentUser() user): Promise<User> {
    return this.userService.userById(user.id);
  }

  @Query(() => LoginResponse, { name: 'login' })
  login(
    @Args('input', { type: () => LoginInput }) input: LoginInput,
  ): Promise<LoginResponse> {
    return this.userService.login(input);
  }

  @Mutation(() => LoginResponse)
  createUser(
    @Args('input', { type: () => CreateUserInput }) input: CreateUserInput,
  ): Promise<LoginResponse> {
    return this.userService.createUser(input);
  }
}
