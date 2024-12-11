import { Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma, Tone } from '@prisma/ads-gen-ms';
import * as grpc from '@grpc/grpc-js';
import { validateFilter, validateRange, validateSort } from 'utils';
import {
  ToneCreateRequest,
  ToneDeleteRequest,
  ToneGetOneRequest,
  ToneListRequest,
  ToneUpdateRequest,
} from 'protos/dist/ads-gen';
import { AdsGenPrismaService } from '../ads-gen-prisma.service';
export class ToneService {
  constructor(
    @Inject()
    private prisma: AdsGenPrismaService,
  ) {}

  async validateToneExistence(tone_id: number): Promise<Tone> {
    const tone = await this.prisma.tone.findUnique({
      where: { id: tone_id },
    });

    if (!tone) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'tone not found',
      });
    }

    return tone;
  }

  async validateTonesExistence(tone_ids: number[]): Promise<Tone[]> {
    const tones = await this.prisma.tone.findMany({
      where: {
        id: { in: tone_ids },
      },
    });
    if (tones.length !== tone_ids.length) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'One or more tones not found',
      });
    }

    return tones;
  }

  async createTone(toneCreateRequest: ToneCreateRequest) {
    const { name, description, created_by_id } = toneCreateRequest;

    const createdTone = await this.prisma.tone.create({
      data: {
        name,
        description,
        created_by_id,
        updated_by_id: created_by_id,
      },
    });

    return createdTone;
  }

  async getOneTone(toneGetOneRequest: ToneGetOneRequest) {
    const { id } = toneGetOneRequest;
    return await this.validateToneExistence(id);
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
      const ownedRecords = await this.prisma.tone.findMany({
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

  async getListTone(toneListRequest: ToneListRequest) {
    const { sort, range, filter, current_user_id } = toneListRequest;
    const fields = Object.keys(Prisma.ToneScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.ToneFindManyArgs = {
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

    const tones = await this.prisma.tone.findMany(queryOptions);
    const totalCount = await this.prisma.tone.count({
      where: queryOptions.where,
    });
    return { tones, totalCount };
  }

  async updateTone(toneUpdateRequest: ToneUpdateRequest) {
    const { id, name, description, updated_by_id } = toneUpdateRequest;

    await this.validateToneExistence(id);

    const updatedTone = await this.prisma.tone.update({
      where: { id },
      data: {
        name,
        description,
        updated_by_id,
      },
    });

    return updatedTone;
  }

  async deleteTone(toneDeleteRequest: ToneDeleteRequest) {
    const { id, deleted_by_id } = toneDeleteRequest;
    await this.validateToneExistence(id);
    const deletedTone = await this.prisma.tone.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id,
      },
    });
    return deletedTone;
  }
}
