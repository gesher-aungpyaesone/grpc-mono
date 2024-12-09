import { Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { User, Prisma } from '@prisma/auth-ms';
import * as grpc from '@grpc/grpc-js';
import { validateFilter, validateRange, validateSort } from 'utils';
import { UserGetOneRequest, UserListRequest } from 'protos/dist/auth';
import { AuthPrismaService } from '../auth-prisma.service';

export class UserService {
  constructor(
    @Inject()
    private prisma: AuthPrismaService,
  ) {}

  async validateUserExistence(user_id: number): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: user_id },
      include: { staff: true },
    });

    if (!existingUser)
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'user not found',
      });

    return existingUser;
  }

  async getOneUser(userGetOneRequest: UserGetOneRequest) {
    const { id } = userGetOneRequest;
    return await this.validateUserExistence(id);
  }

  async getListUser(userListRequest: UserListRequest) {
    const { sort, range, filter } = userListRequest;
    const fields = Object.keys(Prisma.UserScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.UserFindManyArgs = {
      include: { staff: true },
    };
    if (parsedSort) {
      const [field, order] = parsedSort;
      queryOptions.orderBy = { [field]: order };
    }

    if (parsedRange) {
      queryOptions.skip = parsedRange[0];
      queryOptions.take = parsedRange[1] + 1 - parsedRange[0];
    }
    if (parsedFilter && Object.keys(parsedFilter).length > 0) {
      const filterConditions: Record<string, any> = {};
      for (const key in parsedFilter) {
        const filterValue = parsedFilter[key];
        if (key === 'id' && Array.isArray(filterValue)) {
          filterConditions[key] = { in: filterValue };
        } else if (typeof filterValue === 'string') {
          filterConditions[key] = {
            contains: filterValue,
          };
        } else {
          filterConditions[key] = filterValue;
        }
      }

      queryOptions.where = {
        ...queryOptions.where,
        ...filterConditions,
      };
    }

    const users = await this.prisma.user.findMany(queryOptions);
    const totalCount = await this.prisma.user.count({
      where: queryOptions.where,
    });
    return { users, totalCount };
  }
}
