import { GroupPermissionService } from '@app/prisma/auth';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GROUP_PERMISSION_SERVICE_NAME,
  GroupPermissionAssignRequest,
  GroupPermissionListByGroupRequest,
  GroupPermissionListRequest,
  GroupPermissionListResponse,
} from 'protos/dist/auth';
import { transformTimestamps } from 'utils';

@Controller('group-permission')
export class GroupPermissionController {
  constructor(private readonly prisma: GroupPermissionService) {}

  @GrpcMethod(GROUP_PERMISSION_SERVICE_NAME, 'assign') async assign(
    groupPermissionAssignRequest: GroupPermissionAssignRequest,
  ): Promise<GroupPermissionListResponse> {
    const permissions = await this.prisma.assignGroupPermission(
      groupPermissionAssignRequest,
    );
    const transformedGroups = permissions.map((permissions) => {
      const timestamps = transformTimestamps(
        permissions.created_at,
        null,
        null,
      );
      return { ...permissions, ...timestamps };
    });
    return {
      data: transformedGroups,
      total_count: transformedGroups.length,
    };
  }

  @GrpcMethod(GROUP_PERMISSION_SERVICE_NAME, 'getListByGroup')
  async getListByGroup(
    groupPermissionListByGroupRequest: GroupPermissionListByGroupRequest,
  ): Promise<GroupPermissionListResponse> {
    const permissions = await this.prisma.getListGroupPermissionByGroup(
      groupPermissionListByGroupRequest,
    );
    const transformedGroups = permissions.map((permissions) => {
      const timestamps = transformTimestamps(
        permissions.created_at,
        null,
        null,
      );
      return { ...permissions, ...timestamps };
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
        return { ...groupPermission, ...timestamps };
      },
    );

    return {
      data: transformedGroupPermissions,
      total_count: totalCount,
    };
  }
}
