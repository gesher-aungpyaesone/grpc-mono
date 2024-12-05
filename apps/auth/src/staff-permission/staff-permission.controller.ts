import { StaffPermissionService } from '@app/prisma/auth';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  STAFF_PERMISSION_SERVICE_NAME,
  StaffPermissionAssignRequest,
  StaffPermissionDeleteRequest,
  StaffPermissionListByStaffRequest,
  StaffPermissionListRequest,
  StaffPermissionListResponse,
  StaffPermissionResponse,
} from 'protos/dist/auth';
import { transformTimestamps } from 'utils';

@Controller('staff-permission')
export class StaffPermissionController {
  constructor(private readonly prisma: StaffPermissionService) {}

  @GrpcMethod(STAFF_PERMISSION_SERVICE_NAME, 'assign') async assign(
    staffPermissionAssignRequest: StaffPermissionAssignRequest,
  ): Promise<StaffPermissionResponse> {
    const createdStaffPermission = await this.prisma.assignStaffPermission(
      staffPermissionAssignRequest,
    );

    const timestamps = transformTimestamps(
      createdStaffPermission.created_at,
      null,
      null,
    );

    return {
      data: {
        ...createdStaffPermission,
        allow_ids: createdStaffPermission.allow_ids as number[],
        ...timestamps,
      },
    };
  }

  @GrpcMethod(STAFF_PERMISSION_SERVICE_NAME, 'getListByStaff')
  async getListByStaff(
    staffPermissionListByStaffRequest: StaffPermissionListByStaffRequest,
  ): Promise<StaffPermissionListResponse> {
    const permissions = await this.prisma.getListStaffPermissionByStaff(
      staffPermissionListByStaffRequest,
    );
    const transformedStaffs = permissions.map((permission) => {
      const timestamps = transformTimestamps(permission.created_at, null, null);
      return {
        ...permission,
        allow_ids: permission.allow_ids as number[],
        ...timestamps,
      };
    });
    return {
      data: transformedStaffs,
      total_count: transformedStaffs.length,
    };
  }

  @GrpcMethod(STAFF_PERMISSION_SERVICE_NAME, 'getList')
  async getList(
    staffPermissionListRequest: StaffPermissionListRequest,
  ): Promise<StaffPermissionListResponse> {
    const { staffPermissions, totalCount } =
      await this.prisma.getListStaffPermission(staffPermissionListRequest);
    const transformedStaffPermissions = staffPermissions.map(
      (staffPermission) => {
        const timestamps = transformTimestamps(
          staffPermission.created_at,
          null,
          null,
        );
        return {
          ...staffPermission,
          allow_ids: staffPermission.allow_ids as number[],
          ...timestamps,
        };
      },
    );

    return {
      data: transformedStaffPermissions,
      total_count: totalCount,
    };
  }

  @GrpcMethod(STAFF_PERMISSION_SERVICE_NAME, 'delete')
  async delete(
    staffPermissionDeleteRequest: StaffPermissionDeleteRequest,
  ): Promise<StaffPermissionResponse> {
    const deletedStaffPermission = await this.prisma.deleteStaffPermission(
      staffPermissionDeleteRequest,
    );
    const timestamps = transformTimestamps(
      deletedStaffPermission.created_at,
      null,
      null,
    );

    return {
      data: {
        ...deletedStaffPermission,
        allow_ids: deletedStaffPermission.allow_ids as number[],
        ...timestamps,
      },
    };
  }
}
