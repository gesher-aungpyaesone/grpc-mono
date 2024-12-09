import { PermissionService } from '@app/auth-prisma/auth';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  PERMISSION_SERVICE_NAME,
  PermissionGetOneRequest,
  PermissionListRequest,
  PermissionListResponse,
  PermissionResponse,
} from 'protos/dist/auth';

@Controller('permission')
export class PermissionController {
  constructor(private readonly prisma: PermissionService) {}

  @GrpcMethod(PERMISSION_SERVICE_NAME, 'getOne')
  async getOne(
    permissionGetOneRequest: PermissionGetOneRequest,
  ): Promise<PermissionResponse> {
    const permission = await this.prisma.getOnePermission(
      permissionGetOneRequest,
    );

    return { data: permission };
  }

  @GrpcMethod(PERMISSION_SERVICE_NAME, 'getList')
  async getList(
    permissionListRequest: PermissionListRequest,
  ): Promise<PermissionListResponse> {
    const { permissions, totalCount } = await this.prisma.getListPermission(
      permissionListRequest,
    );
    return {
      data: permissions,
      total_count: totalCount,
    };
  }
}
