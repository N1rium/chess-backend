import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserInput, User } from 'src/graphql';

//Fake user DB
const users = {
  '0': {
    id: '0',
    username: 'N1rium',
    email: 'blomgrenjohnny@gmail.com',
  },
  '1': {
    id: '1',
    username: 'Bavern',
    email: 'matt@lotfi.se',
  },
};

@Injectable()
export class UserService {
  async me(token: string): Promise<User> {
    return this.userById(token);
  }

  async userById(id: string): Promise<User> {
    const user = users[id];
    if (!user) throw new NotFoundException({ message: 'No such user' });
    return user;
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const { username, email, password } = input;
    const id = Date.now().toString();
    users[id] = { id, username, email, password };
    return { id, username };
  }
}
