import { PlatformService } from '@app/ads-gen-prisma/ads-gen';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  PLATFORM_SERVICE_NAME,
  PlatformCreateRequest,
  PlatformDeleteRequest,
  PlatformGetOneRequest,
  PlatformListRequest,
  PlatformListResponse,
  PlatformResponse,
  PlatformUpdateRequest,
} from 'protos/dist/ads-gen';
import { transformTimestamps } from 'utils';

@Controller('platform')
export class PlatformController {
  constructor(private readonly prisma: PlatformService) {}
  @GrpcMethod(PLATFORM_SERVICE_NAME, 'create')
  async create(
    platformCreateRequest: PlatformCreateRequest,
  ): Promise<PlatformResponse> {
    const createdPlatform = await this.prisma.createPlatform(
      platformCreateRequest,
    );
    const timestamps = transformTimestamps(
      createdPlatform.created_at,
      createdPlatform.updated_at,
      createdPlatform.deleted_at,
    );

    return {
      data: {
        ...createdPlatform,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(PLATFORM_SERVICE_NAME, 'getOne')
  async getOne(
    platformGetOneRequest: PlatformGetOneRequest,
  ): Promise<PlatformResponse> {
    const platform = await this.prisma.getOnePlatform(platformGetOneRequest);
    const timestamps = transformTimestamps(
      platform.created_at,
      platform.updated_at,
      platform.deleted_at,
    );

    return {
      data: {
        ...platform,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(PLATFORM_SERVICE_NAME, 'getList')
  async getList(
    platformListRequest: PlatformListRequest,
  ): Promise<PlatformListResponse> {
    const { platforms, totalCount } =
      await this.prisma.getListPlatform(platformListRequest);
    const transformedPlatforms = platforms.map((platform) => {
      const timestamps = transformTimestamps(
        platform.created_at,
        platform.updated_at,
        platform.deleted_at,
      );
      return { ...platform, ...timestamps };
    });
    return {
      data: transformedPlatforms,
      total_count: totalCount,
    };
  }

  @GrpcMethod(PLATFORM_SERVICE_NAME, 'update')
  async update(
    platformUpdateRequest: PlatformUpdateRequest,
  ): Promise<PlatformResponse> {
    const updatedPlatform = await this.prisma.updatePlatform(
      platformUpdateRequest,
    );
    const timestamps = transformTimestamps(
      updatedPlatform.created_at,
      updatedPlatform.updated_at,
      updatedPlatform.deleted_at,
    );

    return {
      data: {
        ...updatedPlatform,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(PLATFORM_SERVICE_NAME, 'delete')
  async delete(
    platformDeleteRequest: PlatformDeleteRequest,
  ): Promise<PlatformResponse> {
    const deletedPlatform = await this.prisma.deletePlatform(
      platformDeleteRequest,
    );
    const timestamps = transformTimestamps(
      deletedPlatform.created_at,
      deletedPlatform.updated_at,
      deletedPlatform.deleted_at,
    );

    return {
      data: {
        ...deletedPlatform,
        ...timestamps,
      },
    };
  }
}
