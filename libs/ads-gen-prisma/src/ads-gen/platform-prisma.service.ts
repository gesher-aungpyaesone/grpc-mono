import { Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma, Platform } from '@prisma/ads-gen-ms';
import * as grpc from '@grpc/grpc-js';
import { validateFilter, validateRange, validateSort } from 'utils';
import {
  PlatformCreateRequest,
  PlatformDeleteRequest,
  PlatformGetOneRequest,
  PlatformListRequest,
  PlatformUpdateRequest,
} from 'protos/dist/ads-gen';
import { AdsGenPrismaService } from '../ads-gen-prisma.service';
export class PlatformService {
  constructor(
    @Inject()
    private prisma: AdsGenPrismaService,
  ) {}

  async validatePlatformExistence(platform_id: number): Promise<Platform> {
    const platform = await this.prisma.platform.findUnique({
      where: { id: platform_id },
    });

    if (!platform) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'platform not found',
      });
    }

    return platform;
  }

  async validateplatformsExistence(
    platform_ids: number[],
  ): Promise<Platform[]> {
    const platforms = await this.prisma.platform.findMany({
      where: {
        id: { in: platform_ids },
      },
    });
    if (platforms.length !== platform_ids.length) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'One or more platforms not found',
      });
    }

    return platforms;
  }

  async createPlatform(platformCreateRequest: PlatformCreateRequest) {
    const { name, description, created_by_id } = platformCreateRequest;

    const createdPlatform = await this.prisma.platform.create({
      data: {
        name,
        description,
        created_by_id,
        updated_by_id: created_by_id,
      },
    });

    return createdPlatform;
  }

  async getOnePlatform(platformGetOneRequest: PlatformGetOneRequest) {
    const { id } = platformGetOneRequest;
    return await this.validatePlatformExistence(id);
  }

  async getFilterConditions(
    parsedFilter: Record<string, any>,
    current_user_id: number,
  ) {
    const filterConditions: Record<string, any> = {};

    if (parsedFilter['q']) {
      filterConditions['name'] = { contains: parsedFilter['q'] };
    }
    if (
      parsedFilter['is_allowed_all'] !== undefined &&
      !parsedFilter['is_allowed_all']
    ) {
      const ownedStaffs = await this.prisma.platform.findMany({
        where: {
          created_by_id: current_user_id,
        },
        select: {
          id: true,
        },
      });
      const ownedIds = ownedStaffs.map(({ id }) => id);
      if (parsedFilter['id']) {
        const allowIds = parsedFilter['id'];
        filterConditions['id'] = { in: ownedIds.concat(allowIds) };
      } else {
        filterConditions['id'] = { in: ownedIds };
      }
    }

    if (parsedFilter['exclude']) {
      filterConditions['is_root'] = false;
    }

    console.log('======================');
    console.log(filterConditions);

    return filterConditions;
  }

  async getListPlatform(platformListRequest: PlatformListRequest) {
    const { sort, range, filter, current_user_id } = platformListRequest;
    const fields = Object.keys(Prisma.PlatformScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.PlatformFindManyArgs = {
      where: { deleted_at: null },
    };

    if (parsedSort) {
      const [field, order] = parsedSort;
      queryOptions.orderBy = { [field]: order };
    }

    if (parsedRange) {
      queryOptions.skip = parsedRange[0];
      queryOptions.take = parsedRange[1] + 1 - parsedRange[0];
    }

    if (parsedFilter && Object.keys(parsedFilter).length > 0) {
      const filterConditions = await this.getFilterConditions(
        parsedFilter,
        current_user_id,
      );

      queryOptions.where = {
        ...queryOptions.where,
        ...filterConditions,
      };
    }

    const platforms = await this.prisma.platform.findMany(queryOptions);
    const totalCount = await this.prisma.platform.count({
      where: queryOptions.where,
    });
    return { platforms, totalCount };
  }

  async updatePlatform(platformUpdateRequest: PlatformUpdateRequest) {
    const { id, name, description, updated_by_id } = platformUpdateRequest;

    await this.validatePlatformExistence(id);

    const updatedPlatform = await this.prisma.platform.update({
      where: { id },
      data: {
        name,
        description,
        updated_by_id,
      },
    });

    return updatedPlatform;
  }

  async deletePlatform(platformDeleteRequest: PlatformDeleteRequest) {
    const { id, deleted_by_id } = platformDeleteRequest;
    await this.validatePlatformExistence(id);
    const deletedPlatform = await this.prisma.platform.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id,
      },
    });
    return deletedPlatform;
  }
}
