import { Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as grpc from '@grpc/grpc-js';
import { Prisma } from '@prisma/auth-ms';
import {
  StaffPermissionAssignRequest,
  StaffPermissionListByStaffRequest,
  StaffPermissionListRequest,
} from 'protos/dist/auth';
import { PermissionService } from './permission-prisma.service';
import { StaffService } from './staff-prisma.service';
import { AuthPrismaService } from './auth-prisma.service';
import { validateFilter, validateRange, validateSort } from 'utils';

export class StaffPermissionService {
  constructor(
    @Inject()
    private prisma: AuthPrismaService,
    @Inject()
    private readonly staffService: StaffService,
    @Inject()
    private readonly permissionService: PermissionService,
  ) {}

  async getListStaffPermissionByStaff(
    staffPermissionListByStaffRequest: StaffPermissionListByStaffRequest,
  ) {
    const { staff_id } = staffPermissionListByStaffRequest;
    const staff = await this.prisma.staff.findUnique({
      where: { id: staff_id },
      select: {
        deleted_at: true,
        staff_permissions: {
          include: {
            permission: {
              include: { resource: true, type: true },
            },
          },
        },
      },
    });

    if (!staff || (staff && staff.deleted_at))
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'staff not found',
      });
    return staff.staff_permissions;
  }

  async getListStaffPermission(
    staffPermissionListRequest: StaffPermissionListRequest,
  ) {
    const { sort, range, filter } = staffPermissionListRequest;
    const fields = Object.keys(Prisma.StaffPermissionScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.StaffPermissionFindManyArgs = {
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

    const staffPermissions =
      await this.prisma.staffPermission.findMany(queryOptions);
    const totalCount = await this.prisma.staffPermission.count({
      where: queryOptions.where,
    });

    return { staffPermissions, totalCount };
  }

  async assignStaffPermission(
    staffPermissionAssignRequest: StaffPermissionAssignRequest,
  ) {
    const { staff_id, permission_ids, created_by_id } =
      staffPermissionAssignRequest;
    await this.staffService.validateStaffExistence(staff_id);
    await this.permissionService.validatePermissionsExistence(permission_ids);

    const existingAssignments = await this.prisma.staffPermission.findMany({
      where: {
        staff_id,
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
      const staffPermissions = permissionsToAssign.map((permission_id) => ({
        staff_id,
        permission_id,
        created_by_id,
      }));

      await this.prisma.staffPermission.createMany({
        data: staffPermissions,
      });
    }

    return await this.getListStaffPermissionByStaff({ staff_id });
  }
}
