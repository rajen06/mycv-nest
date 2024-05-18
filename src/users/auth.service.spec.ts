import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of users service
    const users: User[] = [];

    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (user: CreateUserDto) => {
        const createdUser = {
          id: Math.floor(Math.random() * 999),
          email: user.email,
          password: user.password,
        } as User;
        users.push(createdUser);
        return Promise.resolve(createdUser);
      },
    };

    // fakeUsersService = {
    //   find: () => Promise.resolve([]),
    //   create: (user: CreateUserDto) =>
    //     Promise.resolve({
    //       id: 1,
    //       email: user.email,
    //       password: user.password,
    //     } as User),
    // };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('a@a.com', 'password');
    expect(user.password).not.toEqual('password');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with an email that is in use', async () => {
    // fakeUsersService.find = () =>
    //   Promise.resolve([{ id: 1, email: 'a', password: '123' } as User]);
    await service.signup('a@a.com', 'password');
    await expect(service.signup('a@a.com', 'password')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(service.signin('sdad', 'asdasd')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws if an invalid password is provided', async () => {
    // fakeUsersService.find = () =>
    //   Promise.resolve([
    //     {
    //       email: 'aasd',
    //       password: '123',
    //     } as User,
    //   ]);
    await service.signup('a@a.com', 'password');
    await expect(service.signin('a@a.com', 'asdasd')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('a@a.com', 'password');
    const user = await service.signin('a@a.com', 'password');
    expect(user).toBeDefined();
  });
});
