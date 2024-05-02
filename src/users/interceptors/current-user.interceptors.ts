import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private readonly userService: UsersService) {}

  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const { userId } = request.session || 0;
    console.log('userService--', UsersService);
    console.log('userService--', this.userService);
    if (userId) {
      console.log('userId', userId);
      const user = await this.userService.findOne(userId);
      console.log('user', user);
      request.CurrentUser = user;
    }

    return handler.handle();
  }
}
