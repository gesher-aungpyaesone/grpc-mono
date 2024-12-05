import { Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as grpc from '@grpc/grpc-js';
import { GroupPermission, Prisma } from '@prisma/auth-ms';
import {
  GroupPermissionAssignRequest,
  GroupPermissionDeleteRequest,
  GroupPermissionListByGroupRequest,
  GroupPermissionListByStaffRequest,
  GroupPermissionListRequest,
} from 'protos/dist/auth';
import { PermissionService } from './permission-prisma.service';
import { GroupService } from './group-prisma.service';
import { AuthPrismaService } from './auth-prisma.service';
import { validateFilter, validateRange, validateSort } from 'utils';
import { StaffPositionService } from './staff-position-prisma.service';
import { UserService } from './user-prisma.service';
import { StaffService } from './staff-prisma.service';

export class GroupPermissionService {
  constructor(
    @Inject()
    private prisma: AuthPrismaService,
    @Inject()
    private readonly userService: UserService,
    @Inject()
    private readonly staffService: StaffService,
    @Inject()
    private readonly staffPositionService: StaffPositionService,
    @Inject()
    private readonly groupService: GroupService,
    @Inject()
    private readonly permissionService: PermissionService,
  ) {}

  async validateGroupPermissionExistence(id: number): Promise<GroupPermission> {
    const existingGroup = await this.prisma.groupPermission.findUnique({
      where: { id },
    });

    if (!existingGroup)
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'group permission not found',
      });

    return existingGroup;
  }

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

  async getListGroupPermissionByStaff(
    groupPermissionListByStaffRequest: GroupPermissionListByStaffRequest,
  ) {
    const { staff_id } = groupPermissionListByStaffRequest;
    const groupPermissions = await this.prisma.groupPermission.findMany({
      where: {
        group: {
          staff_groups: {
            some: {
              staff_id: staff_id,
            },
          },
        },
      },
      include: {
        permission: {
          include: { resource: true, type: true },
        },
      },
    });
    return groupPermissions;
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
        permission: {
          include: { type: true, resource: true },
        },
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

    const groupPermissions =
      await this.prisma.groupPermission.findMany(queryOptions);
    const totalCount = await this.prisma.groupPermission.count({
      where: queryOptions.where,
    });

    return { groupPermissions, totalCount };
  }

  private async validateAllowIds(resource: string, allow_ids: number[]) {
    switch (resource) {
      case 'staff':
        await this.staffService.validateStaffsExistence(allow_ids);
        break;
      case 'staff-position':
        await this.staffPositionService.validateStaffPositionsExistence(
          allow_ids,
        );
        break;
      case 'group':
        await this.groupService.validategroupsExistence(allow_ids);
        break;
      default:
        break;
    }
  }

  async assignGroupPermission(
    groupPermissionAssignRequest: GroupPermissionAssignRequest,
  ) {
    const {
      group_id,
      permission_id,
      is_allowed_all,
      allow_ids,
      created_by_id,
    } = groupPermissionAssignRequest;
    await this.groupService.validateGroupExistence(group_id);
    await this.userService.validateUserExistence(created_by_id);
    const permission =
      await this.permissionService.validatePermissionExistence(permission_id);
    if (!is_allowed_all && allow_ids) {
      await this.validateAllowIds(permission.resource.name, allow_ids);
    }
    const existingPermission = await this.prisma.groupPermission.findFirst({
      where: { permission_id, group_id },
    });

    if (existingPermission) {
      const updatedStaffPermission = await this.prisma.groupPermission.update({
        where: { id: existingPermission.id },
        data: { is_allowed_all, allow_ids, created_by_id },
      });
      return updatedStaffPermission;
    }

    const createdPermission = await this.prisma.groupPermission.create({
      data: {
        created_by_id,
        group_id,
        permission_id,
        is_allowed_all,
        allow_ids,
      },
    });
    return createdPermission;
  }

  async deleteGroupPermission(
    staffPermissionDeleteRequest: GroupPermissionDeleteRequest,
  ) {
    const { id } = staffPermissionDeleteRequest;
    await this.validateGroupPermissionExistence(id);
    const deletedGroupPermission = await this.prisma.groupPermission.delete({
      where: { id },
    });
    return deletedGroupPermission;
  }
}
