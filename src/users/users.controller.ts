import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Query,
  Delete,
  NotFoundException,
  Session,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';

@Serialize(UserDto)
@Controller('auth')
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('signup')
  async createUser(
    @Body() user: CreateUserDto,
    @Session() session: any,
  ): Promise<any> {
    const userRes = await this.authService.signup(user?.email, user?.password);
    session.userId = userRes.id;
    return userRes;
  }

  @Get('whoami')
  whoami(@CurrentUser() user: any) {
    // return this.usersService.findOne(session.userId);
    return user;
  }

  @Post('signin')
  async signin(
    @Body() user: CreateUserDto,
    @Session() session: any,
  ): Promise<any> {
    const userRes = await this.authService.signin(user?.email, user?.password);
    session.userId = userRes.id;
    return userRes;
  }

  @Post('signout')
  async signout(@Session() session: any): Promise<any> {
    session.userId = null;
    return {
      message: 'Signout success',
    };
  }

  @Get(':id')
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(parseInt(id));
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get()
  findAllUsers(@Query('email') email: string) {
    return this.usersService.find(email);
  }

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return this.usersService.update(parseInt(id), user);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id));
  }

  // @Get('colors/:color')
  // async setColor(@Param('color') color: string, @Session() session: any) {
  //   session.color = color;
  // }

  // @Get('colors')
  // async getColor(@Session() session: any) {
  //   console.log("session is", session);
  //   return session.color;
  // }
}
