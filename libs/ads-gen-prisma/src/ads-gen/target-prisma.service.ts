import { Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma, Target } from '@prisma/ads-gen-ms';
import * as grpc from '@grpc/grpc-js';
import { validateFilter, validateRange, validateSort } from 'utils';
import {
  TargetCreateRequest,
  TargetDeleteRequest,
  TargetGetOneRequest,
  TargetListRequest,
  TargetUpdateRequest,
} from 'protos/dist/ads-gen';
import { AdsGenPrismaService } from '../ads-gen-prisma.service';
export class TargetService {
  constructor(
    @Inject()
    private prisma: AdsGenPrismaService,
  ) {}

  async validateTargetExistence(target_id: number): Promise<Target> {
    const target = await this.prisma.target.findUnique({
      where: { id: target_id },
    });

    if (!target) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'target not found',
      });
    }

    return target;
  }

  async validateTargetsExistence(target_ids: number[]): Promise<Target[]> {
    const targets = await this.prisma.target.findMany({
      where: {
        id: { in: target_ids },
      },
    });
    if (targets.length !== target_ids.length) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'One or more targets not found',
      });
    }

    return targets;
  }

  async createTarget(targetCreateRequest: TargetCreateRequest) {
    const { name, description, created_by_id } = targetCreateRequest;

    const createdTarget = await this.prisma.target.create({
      data: {
        name,
        description,
        created_by_id,
        updated_by_id: created_by_id,
      },
    });

    return createdTarget;
  }

  async getOneTarget(targetGetOneRequest: TargetGetOneRequest) {
    const { id } = targetGetOneRequest;
    return await this.validateTargetExistence(id);
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
      const ownedRecords = await this.prisma.target.findMany({
        where: {
          created_by_id: current_user_id,
        },
        select: {
          id: true,
        },
      });
      const ownedIds = ownedRecords.map(({ id }) => id);
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

    return filterConditions;
  }

  async getListTarget(targetListRequest: TargetListRequest) {
    const { sort, range, filter, current_user_id } = targetListRequest;
    const fields = Object.keys(Prisma.TargetScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.TargetFindManyArgs = {
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

    const targets = await this.prisma.target.findMany(queryOptions);
    const totalCount = await this.prisma.target.count({
      where: queryOptions.where,
    });
    return { targets, totalCount };
  }

  async updateTarget(targetUpdateRequest: TargetUpdateRequest) {
    const { id, name, description, updated_by_id } = targetUpdateRequest;

    await this.validateTargetExistence(id);

    const updatedTarget = await this.prisma.target.update({
      where: { id },
      data: {
        name,
        description,
        updated_by_id,
      },
    });

    return updatedTarget;
  }

  async deleteTarget(targetDeleteRequest: TargetDeleteRequest) {
    const { id, deleted_by_id } = targetDeleteRequest;
    await this.validateTargetExistence(id);
    const deletedTarget = await this.prisma.target.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id,
      },
    });
    return deletedTarget;
  }
}
