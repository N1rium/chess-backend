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

import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async login(input: LoginInput): Promise<LoginResponse> {
    const { email, password } = input;
    const user = await this.userByEmail(email);
    const { salt, password: storedPassword } = user;

    const encrypted = this.sha512(password, salt);

    if (storedPassword !== encrypted.passwordHash)
      throw new BadRequestException({ message: 'Wrong password' });

    const token = jwt.sign(
      {
        username: user.username,
        id: user.id,
      },
      'secret',
    );
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

    const encrypted = this.saltHashPassword(password);
    const { salt, passwordHash } = encrypted;

    const user = await this.usersRepository.save({
      username,
      email,
      password: passwordHash,
      salt,
    });

    const token = jwt.sign(
      {
        username: user.username,
        id: user.id,
      },
      'secret',
    );

    return { user, token };
  }

  /* ====== CRYPTO ======  */

  /**
   * generates random string of characters i.e salt
   * @function
   * @param {number} length - Length of the random string.
   */
  genRandomString(length) {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex') /** convert to hexadecimal format */
      .slice(0, length); /** return required number of characters */
  }

  /**
   * hash password with sha512.
   * @function
   * @param {string} password - List of required fields.
   * @param {string} salt - Data to be validated.
   */
  sha512(password, salt) {
    const hash = crypto.createHmac(
      'sha512',
      salt,
    ); /** Hashing algorithm sha512 */
    hash.update(password);
    const value = hash.digest('hex');
    return {
      salt,
      passwordHash: value,
    };
  }

  saltHashPassword(password) {
    return this.sha512(password, this.genRandomString(16));
  }
}
