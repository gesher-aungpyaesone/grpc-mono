import { UserService } from '@app/prisma/auth';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  USER_SERVICE_NAME,
  UserGetOneRequest,
  UserListRequest,
  UserListResponse,
  UserResponse,
} from 'protos/dist/auth';
import { convertSystemUserTypeGrpcToPrisma } from 'utils';

@Controller('user')
export class UserController {
  constructor(private readonly prisma: UserService) {}

  @GrpcMethod(USER_SERVICE_NAME, 'getOne')
  async getOne(userGetOneRequest: UserGetOneRequest): Promise<UserResponse> {
    const user = await this.prisma.getOneUser(userGetOneRequest);
    return {
      data: { ...user, type: convertSystemUserTypeGrpcToPrisma(user.type) },
    };
  }

  @GrpcMethod(USER_SERVICE_NAME, 'getList')
  async getList(userListRequest: UserListRequest): Promise<UserListResponse> {
    const { users, totalCount } =
      await this.prisma.getListUser(userListRequest);
    const transformedUsers = users.map((user) => {
      const type = convertSystemUserTypeGrpcToPrisma(user.type);
      return { ...user, type };
    });
    return {
      data: transformedUsers,
      total_count: totalCount,
    };
  }
}
