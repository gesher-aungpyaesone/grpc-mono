import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  AUTH_PACKAGE_NAME,
  USER_SERVICE_NAME,
  UserListResponse,
  UserResponse,
  UserServiceClient,
} from 'protos/dist/auth';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'utils';
import { UserListDto } from './dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { StaffAuthGuard } from '../../guard';

@Controller('user')
export class UserController implements OnModuleInit {
  private userService: UserServiceClient;
  constructor(@Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.userService =
      this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @Get(':id')
  getOne(@Param('id') id: number): Observable<UserResponse> {
    return this.userService.getOne({ id: +id }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @Get()
  getList(@Query() staffListDto: UserListDto): Observable<UserListResponse> {
    return this.userService.getList({ ...staffListDto }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }
}
