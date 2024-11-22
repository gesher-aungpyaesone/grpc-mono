import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/auth-ms';
import * as grpc from '@grpc/grpc-js';
import {
  StaffPermissionAssignRequest,
  StaffPermissionListByStaffRequest,
} from 'protos/dist/auth';
import { PermissionService } from './permission-prisma.service';

export class StaffPermissionService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly permissionService: PermissionService) {
    super({ log: ['query', 'info', 'warn', 'error'] });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async getListStaffPermissionByStaff(
    staffPermissionListByStaffRequest: StaffPermissionListByStaffRequest,
  ) {
    const { staff_id } = staffPermissionListByStaffRequest;
    const staff = await this.staff.findUnique({
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

  async assignStaffPermission(
    staffPermissionAssignRequest: StaffPermissionAssignRequest,
  ) {
    const { staff_id, permission_ids, created_by_id } =
      staffPermissionAssignRequest;
    // await this.validateStaffExistence(staff_id);
    await this.permissionService.validatePermissionsExistence(permission_ids);

    const existingAssignments = await this.staffPermission.findMany({
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

      await this.staffPermission.createMany({
        data: staffPermissions,
      });
    }

    return await this.getListStaffPermissionByStaff({ staff_id });
  }
}
