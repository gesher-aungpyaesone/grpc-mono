import { StaffPermissionService } from '@app/prisma/auth';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  STAFF_PERMISSION_SERVICE_NAME,
  StaffPermissionAssignRequest,
  StaffPermissionListByStaffRequest,
  StaffPermissionListResponse,
} from 'protos/dist/auth';
import { transformTimestamps } from 'utils';

@Controller('staff-permission')
export class StaffPermissionController {
  constructor(private readonly prisma: StaffPermissionService) {}

  @GrpcMethod(STAFF_PERMISSION_SERVICE_NAME, 'assign') async assign(
    staffPermissionAssignRequest: StaffPermissionAssignRequest,
  ): Promise<StaffPermissionListResponse> {
    const permissions = await this.prisma.assignStaffPermission(
      staffPermissionAssignRequest,
    );
    const transformedStaffs = permissions.map((permissions) => {
      const timestamps = transformTimestamps(
        permissions.created_at,
        null,
        null,
      );
      return { ...permissions, ...timestamps };
    });
    return {
      data: transformedStaffs,
      total_count: transformedStaffs.length,
    };
  }

  @GrpcMethod(STAFF_PERMISSION_SERVICE_NAME, 'getListByStaff')
  async getList(
    staffPermissionListByStaffRequest: StaffPermissionListByStaffRequest,
  ): Promise<StaffPermissionListResponse> {
    const permissions = await this.prisma.getListStaffPermissionByStaff(
      staffPermissionListByStaffRequest,
    );
    const transformedStaffs = permissions.map((permissions) => {
      const timestamps = transformTimestamps(
        permissions.created_at,
        null,
        null,
      );
      return { ...permissions, ...timestamps };
    });
    return {
      data: transformedStaffs,
      total_count: transformedStaffs.length,
    };
  }
}
