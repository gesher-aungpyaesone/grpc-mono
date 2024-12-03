import { RpcException } from '@nestjs/microservices';
import { Permission, Prisma } from '@prisma/auth-ms';
import * as grpc from '@grpc/grpc-js';
import { validateFilter, validateRange, validateSort } from 'utils';
import {
  PermissionGetOneRequest,
  PermissionListRequest,
} from 'protos/dist/auth';
import { Inject } from '@nestjs/common';
import { AuthPrismaService } from './auth-prisma.service';

export class PermissionService {
  constructor(
    @Inject()
    private prisma: AuthPrismaService,
  ) {}

  async validatePermissionsExistence(
    permission_ids: number[],
  ): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany({
      where: {
        id: { in: permission_ids },
      },
      include: { type: true, resource: true },
    });
    if (permissions.length !== permission_ids.length) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'One or more permissions not found',
      });
    }

    return permissions;
  }

  async validatePermissionExistence(permission_id: number) {
    const permission = await this.prisma.permission.findUnique({
      where: { id: permission_id },
      include: { type: true, resource: true },
    });

    if (!permission) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'permission not found',
      });
    }

    return permission;
  }

  async getOnePermission(permissionGetOneRequest: PermissionGetOneRequest) {
    const { id } = permissionGetOneRequest;
    return await this.validatePermissionExistence(id);
  }

  async getListPermission(permissionListRequest: PermissionListRequest) {
    const { sort, range, filter } = permissionListRequest;
    const fields = Object.keys(Prisma.PermissionScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.PermissionFindManyArgs = {
      include: { type: true, resource: true },
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
      for (let key in parsedFilter) {
        const filterValue = parsedFilter[key];
        if (key === 'q') {
          key = 'name';
        }
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

    const permissions = await this.prisma.permission.findMany(queryOptions);
    const totalCount = await this.prisma.permission.count({
      where: queryOptions.where,
    });
    return { permissions, totalCount };
  }
}
