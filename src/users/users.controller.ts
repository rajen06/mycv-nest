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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async createUser(@Body() user: CreateUserDto): Promise<any> {
    this.usersService.create(user);
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
}
