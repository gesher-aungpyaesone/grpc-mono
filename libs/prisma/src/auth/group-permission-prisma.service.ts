import { Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as grpc from '@grpc/grpc-js';
import { Prisma } from '@prisma/auth-ms';
import {
  GroupPermissionAssignRequest,
  GroupPermissionListByGroupRequest,
  GroupPermissionListRequest,
} from 'protos/dist/auth';
import { PermissionService } from './permission-prisma.service';
import { AuthPrismaService } from './auth-prisma.service';
import { validateFilter, validateRange, validateSort } from 'utils';
import { GroupService } from './group-prisma.service';

export class GroupPermissionService {
  constructor(
    @Inject()
    private prisma: AuthPrismaService,
    @Inject()
    private readonly groupService: GroupService,
    @Inject()
    private readonly permissionService: PermissionService,
  ) {}

  async getListGroupPermissionByGroup(
    groupPermissionListByGroupRequest: GroupPermissionListByGroupRequest,
  ) {
    const { group_id } = groupPermissionListByGroupRequest;
    const group = await this.prisma.group.findUnique({
      where: { id: group_id },
      select: {
        deleted_at: true,
        group_permissions: {
          include: {
            permission: {
              include: { resource: true, type: true },
            },
          },
        },
      },
    });

    if (!group || (group && group.deleted_at))
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'group not found',
      });
    return group.group_permissions;
  }

  async getListGroupPermission(
    groupPermissionListRequest: GroupPermissionListRequest,
  ) {
    const { sort, range, filter } = groupPermissionListRequest;
    const fields = Object.keys(Prisma.GroupPermissionScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.GroupPermissionFindManyArgs = {
      include: {
        permission: true,
      },
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

    const groupPermissions =
      await this.prisma.groupPermission.findMany(queryOptions);
    const totalCount = await this.prisma.groupPermission.count({
      where: queryOptions.where,
    });

    return { groupPermissions, totalCount };
  }

  async assignGroupPermission(
    groupPermissionAssignRequest: GroupPermissionAssignRequest,
  ) {
    const { group_id, permission_ids, created_by_id } =
      groupPermissionAssignRequest;
    await this.groupService.validateGroupExistence(group_id);
    await this.permissionService.validatePermissionsExistence(permission_ids);

    const existingAssignments = await this.prisma.groupPermission.findMany({
      where: {
        group_id,
        permission_id: { in: permission_ids },
      },
      select: { permission_id: true },
    });

    const alreadyAssignedPermissionIds = existingAssignments.map(
      (assignment) => assignment.permission_id,
    );

    const permissionsToAssign = permission_ids.filter(
      (permission_id) => !alreadyAssignedPermissionIds.includes(permission_id),
    );

    if (permissionsToAssign.length) {
      const groupPermissions = permissionsToAssign.map((permission_id) => ({
        group_id,
        permission_id,
        created_by_id,
      }));

      await this.prisma.groupPermission.createMany({
        data: groupPermissions,
      });
    }

    return await this.getListGroupPermissionByGroup({ group_id });
  }
}
