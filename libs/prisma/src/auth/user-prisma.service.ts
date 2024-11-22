import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { User, Prisma, PrismaClient } from '@prisma/auth-ms';
import * as grpc from '@grpc/grpc-js';
import { validateFilter, validateRange, validateSort } from 'utils';
import { UserGetOneRequest, UserListRequest } from 'protos/dist/auth';

export class UserService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({ log: ['query', 'info', 'warn', 'error'] });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async validateUserExistence(user_id: number): Promise<User> {
    const existingUser = await this.user.findUnique({
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
      queryOptions.take = parsedRange[1] - parsedRange[0];
    }
    if (parsedFilter && Object.keys(parsedFilter).length > 0) {
      const filterConditions: Record<string, any> = {};
      for (const key in parsedFilter) {
        if (key in parsedFilter) {
          const filterValue = parsedFilter[key];
          if (key === 'id' && Array.isArray(filterValue)) {
            filterConditions[key] = { in: filterValue };
          } else if (typeof filterValue === 'string') {
            filterConditions[key] = {
              contains: filterValue,
              mode: 'insensitive',
            };
          } else {
            filterConditions[key] = filterValue;
          }
        }
      }

      queryOptions.where = {
        ...queryOptions.where,
        ...filterConditions,
      };
    }

    const users = await this.user.findMany(queryOptions);
    const totalCount = await this.user.count({
      where: queryOptions.where,
      skip: queryOptions.skip,
      take: queryOptions.take,
    });
    return { users, totalCount };
  }
}
