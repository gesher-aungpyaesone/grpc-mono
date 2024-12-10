import { Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma, Industry } from '@prisma/ads-gen-ms';
import * as grpc from '@grpc/grpc-js';
import { validateFilter, validateRange, validateSort } from 'utils';
import {
  IndustryCreateRequest,
  IndustryDeleteRequest,
  IndustryGetOneRequest,
  IndustryListRequest,
  IndustryUpdateRequest,
} from 'protos/dist/ads-gen';
import { AdsGenPrismaService } from '../ads-gen-prisma.service';
export class IndustryService {
  constructor(
    @Inject()
    private prisma: AdsGenPrismaService,
  ) {}

  async validateIndustryExistence(industry_id: number): Promise<Industry> {
    const industry = await this.prisma.industry.findUnique({
      where: { id: industry_id },
    });

    if (!industry) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'industry not found',
      });
    }

    return industry;
  }

  async validateindustrysExistence(
    industry_ids: number[],
  ): Promise<Industry[]> {
    const industrys = await this.prisma.industry.findMany({
      where: {
        id: { in: industry_ids },
      },
    });
    if (industrys.length !== industry_ids.length) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'One or more industrys not found',
      });
    }

    return industrys;
  }

  async createIndustry(industryCreateRequest: IndustryCreateRequest) {
    const { name, description, created_by_id } = industryCreateRequest;

    const createdIndustry = await this.prisma.industry.create({
      data: {
        name,
        description,
        created_by_id,
        updated_by_id: created_by_id,
      },
    });

    return createdIndustry;
  }

  async getOneIndustry(industryGetOneRequest: IndustryGetOneRequest) {
    const { id } = industryGetOneRequest;
    return await this.validateIndustryExistence(id);
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
      const ownedStaffs = await this.prisma.industry.findMany({
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

    return filterConditions;
  }

  async getListIndustry(industryListRequest: IndustryListRequest) {
    const { sort, range, filter, current_user_id } = industryListRequest;
    const fields = Object.keys(Prisma.IndustryScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.IndustryFindManyArgs = {
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

    const industrys = await this.prisma.industry.findMany(queryOptions);
    const totalCount = await this.prisma.industry.count({
      where: queryOptions.where,
    });
    return { industrys, totalCount };
  }

  async updateIndustry(industryUpdateRequest: IndustryUpdateRequest) {
    const { id, name, description, updated_by_id } = industryUpdateRequest;

    await this.validateIndustryExistence(id);

    const updatedIndustry = await this.prisma.industry.update({
      where: { id },
      data: {
        name,
        description,
        updated_by_id,
      },
    });

    return updatedIndustry;
  }

  async deleteIndustry(industryDeleteRequest: IndustryDeleteRequest) {
    const { id, deleted_by_id } = industryDeleteRequest;
    await this.validateIndustryExistence(id);
    const deletedIndustry = await this.prisma.industry.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id,
      },
    });
    return deletedIndustry;
  }
}
