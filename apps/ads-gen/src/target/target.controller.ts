import { TargetService } from '@app/ads-gen-prisma/ads-gen';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  TARGET_SERVICE_NAME,
  TargetCreateRequest,
  TargetDeleteRequest,
  TargetGetOneRequest,
  TargetListRequest,
  TargetListResponse,
  TargetResponse,
  TargetUpdateRequest,
} from 'protos/dist/ads-gen';
import { transformTimestamps } from 'utils';

@Controller('target')
export class TargetController {
  constructor(private readonly prisma: TargetService) {}
  @GrpcMethod(TARGET_SERVICE_NAME, 'create')
  async create(
    targetCreateRequest: TargetCreateRequest,
  ): Promise<TargetResponse> {
    const createdTarget = await this.prisma.createTarget(targetCreateRequest);
    const timestamps = transformTimestamps(
      createdTarget.created_at,
      createdTarget.updated_at,
      createdTarget.deleted_at,
    );

    return {
      data: {
        ...createdTarget,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(TARGET_SERVICE_NAME, 'getOne')
  async getOne(
    targetGetOneRequest: TargetGetOneRequest,
  ): Promise<TargetResponse> {
    const target = await this.prisma.getOneTarget(targetGetOneRequest);
    const timestamps = transformTimestamps(
      target.created_at,
      target.updated_at,
      target.deleted_at,
    );

    return {
      data: {
        ...target,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(TARGET_SERVICE_NAME, 'getList')
  async getList(
    targetListRequest: TargetListRequest,
  ): Promise<TargetListResponse> {
    const { targets, totalCount } =
      await this.prisma.getListTarget(targetListRequest);
    const transformedTargets = targets.map((target) => {
      const timestamps = transformTimestamps(
        target.created_at,
        target.updated_at,
        target.deleted_at,
      );
      return { ...target, ...timestamps };
    });
    return {
      data: transformedTargets,
      total_count: totalCount,
    };
  }

  @GrpcMethod(TARGET_SERVICE_NAME, 'update')
  async update(
    targetUpdateRequest: TargetUpdateRequest,
  ): Promise<TargetResponse> {
    const updatedTarget = await this.prisma.updateTarget(targetUpdateRequest);
    const timestamps = transformTimestamps(
      updatedTarget.created_at,
      updatedTarget.updated_at,
      updatedTarget.deleted_at,
    );

    return {
      data: {
        ...updatedTarget,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(TARGET_SERVICE_NAME, 'delete')
  async delete(
    targetDeleteRequest: TargetDeleteRequest,
  ): Promise<TargetResponse> {
    const deletedTarget = await this.prisma.deleteTarget(targetDeleteRequest);
    const timestamps = transformTimestamps(
      deletedTarget.created_at,
      deletedTarget.updated_at,
      deletedTarget.deleted_at,
    );

    return {
      data: {
        ...deletedTarget,
        ...timestamps,
      },
    };
  }
}
