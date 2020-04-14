import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  User,
  LoginInput,
  LoginResponse,
  CreateUserInput,
} from './user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async me(token: string): Promise<User> {
    return this.userById(token);
  }

  async login(input: LoginInput): Promise<LoginResponse> {
    const { email, password } = input;
    const user = (await this.userByEmail(email)) as User;
    if (password !== user.password)
      throw new BadRequestException({ message: 'Wrong password' });

    const token = this.jwtService.sign({
      username: user.username,
      id: user.id,
    });
    return { user, token };
  }

  async userById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne(id);
    if (!user) throw new NotFoundException({ message: 'No such user' });
    return user;
  }

  async userByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ email });
    if (!user) throw new NotFoundException({ message: 'No such user' });
    return user;
  }

  async createUser(input: CreateUserInput): Promise<LoginResponse> {
    const { username, email, password, passwordRepeat } = input;
    if (password !== passwordRepeat)
      throw new BadRequestException({ message: 'Password mismatch' });
    const user = await this.usersRepository.save({
      username,
      email,
      password,
    });

    const token = this.jwtService.sign({
      username: user.username,
      id: user.id,
    });

    return { user, token };
  }
}
