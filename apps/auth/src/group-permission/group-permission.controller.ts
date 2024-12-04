import { GroupPermissionService } from '@app/prisma/auth';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GROUP_PERMISSION_SERVICE_NAME,
  GroupPermissionAssignRequest,
  GroupPermissionListByGroupRequest,
  GroupPermissionListByStaffRequest,
  GroupPermissionListRequest,
  GroupPermissionListResponse,
  GroupPermissionResponse,
} from 'protos/dist/auth';
import { transformTimestamps } from 'utils';

@Controller('group-permission')
export class GroupPermissionController {
  constructor(private readonly prisma: GroupPermissionService) {}

  @GrpcMethod(GROUP_PERMISSION_SERVICE_NAME, 'assign') async assign(
    groupPermissionAssignRequest: GroupPermissionAssignRequest,
  ): Promise<GroupPermissionResponse> {
    const createdGroupPermission = await this.prisma.assignGroupPermission(
      groupPermissionAssignRequest,
    );

    const timestamps = transformTimestamps(
      createdGroupPermission.created_at,
      null,
      null,
    );

    return {
      data: {
        ...createdGroupPermission,
        allow_ids: createdGroupPermission.allow_ids as number[],
        ...timestamps,
      },
    };
  }

  @GrpcMethod(GROUP_PERMISSION_SERVICE_NAME, 'getListByGroup')
  async getListByGroup(
    groupPermissionListByGroupRequest: GroupPermissionListByGroupRequest,
  ): Promise<GroupPermissionListResponse> {
    const permissions = await this.prisma.getListGroupPermissionByGroup(
      groupPermissionListByGroupRequest,
    );
    const transformedGroups = permissions.map((permission) => {
      const timestamps = transformTimestamps(permission.created_at, null, null);
      return {
        ...permission,
        allow_ids: permission.allow_ids as number[],
        ...timestamps,
      };
    });
    return {
      data: transformedGroups,
      total_count: transformedGroups.length,
    };
  }

  @GrpcMethod(GROUP_PERMISSION_SERVICE_NAME, 'getListByStaff')
  async getListByStaff(
    groupPermissionListByStaffRequest: GroupPermissionListByStaffRequest,
  ): Promise<GroupPermissionListResponse> {
    const permissions = await this.prisma.getListGroupPermissionByStaff(
      groupPermissionListByStaffRequest,
    );
    const transformedGroups = permissions.map((permission) => {
      const timestamps = transformTimestamps(permission.created_at, null, null);
      return {
        ...permission,
        allow_ids: permission.allow_ids as number[],
        ...timestamps,
      };
    });
    return {
      data: transformedGroups,
      total_count: transformedGroups.length,
    };
  }

  @GrpcMethod(GROUP_PERMISSION_SERVICE_NAME, 'getList')
  async getList(
    groupPermissionListRequest: GroupPermissionListRequest,
  ): Promise<GroupPermissionListResponse> {
    const { groupPermissions, totalCount } =
      await this.prisma.getListGroupPermission(groupPermissionListRequest);
    const transformedGroupPermissions = groupPermissions.map(
      (groupPermission) => {
        const timestamps = transformTimestamps(
          groupPermission.created_at,
          null,
          null,
        );
        return {
          ...groupPermission,
          allow_ids: groupPermission.allow_ids as number[],
          ...timestamps,
        };
      },
    );

    return {
      data: transformedGroupPermissions,
      total_count: totalCount,
    };
  }
}
