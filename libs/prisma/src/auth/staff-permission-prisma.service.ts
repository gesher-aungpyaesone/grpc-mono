import { Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as grpc from '@grpc/grpc-js';
import { Prisma, StaffPermission } from '@prisma/auth-ms';
import {
  StaffPermissionAssignRequest,
  StaffPermissionDeleteRequest,
  StaffPermissionListByStaffRequest,
  StaffPermissionListRequest,
} from 'protos/dist/auth';
import { PermissionService } from './permission-prisma.service';
import { StaffService } from './staff-prisma.service';
import { AuthPrismaService } from './auth-prisma.service';
import { validateFilter, validateRange, validateSort } from 'utils';
import { StaffPositionService } from './staff-position-prisma.service';
import { UserService } from './user-prisma.service';
import { GroupService } from './group-prisma.service';

export class StaffPermissionService {
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

  async validateStaffPermissionExistence(id: number): Promise<StaffPermission> {
    const existingStaff = await this.prisma.staffPermission.findUnique({
      where: { id },
    });

    if (!existingStaff)
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'staff permission not found',
      });

    return existingStaff;
  }

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

    const staffPermissions =
      await this.prisma.staffPermission.findMany(queryOptions);
    const totalCount = await this.prisma.staffPermission.count({
      where: queryOptions.where,
    });

    return { staffPermissions, totalCount };
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

  async assignStaffPermission(
    staffPermissionAssignRequest: StaffPermissionAssignRequest,
  ) {
    const {
      staff_id,
      permission_id,
      is_allowed_all,
      allow_ids,
      created_by_id,
    } = staffPermissionAssignRequest;

    await this.staffService.validateStaffExistence(staff_id);
    await this.userService.validateUserExistence(created_by_id);
    const permission =
      await this.permissionService.validatePermissionExistence(permission_id);
    if (!is_allowed_all && allow_ids) {
      await this.validateAllowIds(permission.resource.name, allow_ids);
    }

    this.assignAdditionalPermisions(permission, staffPermissionAssignRequest);

    const existingPermission = await this.prisma.staffPermission.findFirst({
      where: { permission_id, staff_id },
    });

    if (existingPermission) {
      const updatedStaffPermission = await this.prisma.staffPermission.update({
        where: { id: existingPermission.id },
        data: { is_allowed_all, allow_ids, created_by_id },
      });
      return updatedStaffPermission;
    }

    const createdStaffPermission = await this.prisma.staffPermission.create({
      data: {
        created_by_id,
        staff_id,
        permission_id,
        is_allowed_all,
        allow_ids,
      },
    });
    return createdStaffPermission;
  }

  private async assignAdditionalPermisions(
    permission: any,
    staffPermissionAssignRequest: StaffPermissionAssignRequest,
  ) {
    if (permission.type.name === 'create') {
      await this.assignAdditionalPermission(
        permission.resource_id,
        'read',
        staffPermissionAssignRequest,
      );
      await this.assignAdditionalPermission(
        permission.resource_id,
        'edit',
        staffPermissionAssignRequest,
      );
    } else if (permission.resource.name === 'edit') {
      await this.assignAdditionalPermission(
        permission.resource_id,
        'read',
        staffPermissionAssignRequest,
      );
    }
  }

  private async assignAdditionalPermission(
    resource_id: number,
    type: string,
    staffPermissionAssignRequest: StaffPermissionAssignRequest,
  ) {
    const { created_by_id, staff_id, is_allowed_all, allow_ids } =
      staffPermissionAssignRequest;
    const permission = await this.prisma.permission.findFirst({
      where: {
        resource_id,
        type: {
          name: type,
        },
      },
    });
    if (!permission) return false;

    const existingPermission = await this.prisma.staffPermission.findFirst({
      where: {
        staff_id,
        permission_id: permission.id,
      },
    });

    if (existingPermission) return false;

    await this.prisma.staffPermission.create({
      data: {
        created_by_id,
        staff_id,
        permission_id: permission.id,
        is_allowed_all,
        allow_ids,
      },
    });
    return true;
  }

  async deleteStaffPermission(
    staffPermissionDeleteRequest: StaffPermissionDeleteRequest,
  ) {
    const { id } = staffPermissionDeleteRequest;
    await this.validateStaffPermissionExistence(id);
    const deletedStaffPermission = await this.prisma.staffPermission.delete({
      where: { id },
    });
    return deletedStaffPermission;
  }
}
