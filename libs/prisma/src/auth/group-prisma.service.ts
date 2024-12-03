import { Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma, Group } from '@prisma/auth-ms';
import * as grpc from '@grpc/grpc-js';
import { validateFilter, validateRange, validateSort } from 'utils';
import {
  GroupCreateRequest,
  GroupDeleteRequest,
  GroupGetOneRequest,
  GroupListRequest,
  GroupUpdateRequest,
} from 'protos/dist/auth';
import { AuthPrismaService } from './auth-prisma.service';
import { PermissionService } from './permission-prisma.service';
import { StaffService } from './staff-prisma.service';
export class GroupService {
  constructor(
    @Inject()
    private prisma: AuthPrismaService,
    @Inject()
    private readonly staffService: StaffService,
    @Inject()
    private readonly permissionService: PermissionService,
  ) {}

  async validateGroupExistence(group_id: number): Promise<Group> {
    const group = await this.prisma.group.findUnique({
      where: { id: group_id },
      include: {
        staff_groups: true,
        group_permissions: true,
      },
    });

    if (!group) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'group not found',
      });
    }

    return group;
  }

  async createGroup(groupCreateRequest: GroupCreateRequest) {
    const { name, description, created_by_id, staff_ids, permission_ids } =
      groupCreateRequest;

    const staffs = staff_ids
      ? await this.staffService.validateStaffsExistence(staff_ids)
      : [];
    const permissions = permission_ids
      ? await this.permissionService.validatePermissionsExistence(
          permission_ids,
        )
      : [];

    // TODO
    const createdGroup = await this.prisma.group.create({
      data: {
        name,
        description,
        created_by_id,
        updated_by_id: created_by_id,
        staff_groups: {
          create: staffs.map((staff) => ({
            staff_id: staff.id,
            created_by_id,
          })),
        },
        group_permissions: {
          create: permissions.map((permission) => ({
            permission_id: permission.id,
            created_by_id,
          })),
        },
      },
    });

    return createdGroup;
  }

  async getOneGroup(groupGetOneRequest: GroupGetOneRequest) {
    const { id } = groupGetOneRequest;
    return await this.validateGroupExistence(id);
  }

  async getListGroup(groupListRequest: GroupListRequest) {
    const { sort, range, filter } = groupListRequest;
    const fields = Object.keys(Prisma.GroupScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.GroupFindManyArgs = {
      where: { deleted_at: null },
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
        if (key === 'q') {
          key = 'name';
        }
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

    const groups = await this.prisma.group.findMany(queryOptions);
    const totalCount = await this.prisma.group.count({
      where: queryOptions.where,
    });
    return { groups, totalCount };
  }

  async updateGroup(groupUpdateRequest: GroupUpdateRequest) {
    const { id, name, description, updated_by_id } = groupUpdateRequest;

    await this.validateGroupExistence(id);

    const updatedGroup = await this.prisma.group.update({
      where: { id },
      data: {
        name,
        description,
        updated_by_id,
      },
    });

    return updatedGroup;
  }

  async deleteGroup(groupDeleteRequest: GroupDeleteRequest) {
    const { id, deleted_by_id } = groupDeleteRequest;
    await this.validateGroupExistence(id);
    const deletedGroup = await this.prisma.group.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id,
      },
    });
    return deletedGroup;
  }
}
