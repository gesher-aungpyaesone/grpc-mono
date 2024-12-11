import { Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma, CompanySize } from '@prisma/ads-gen-ms';
import * as grpc from '@grpc/grpc-js';
import { validateFilter, validateRange, validateSort } from 'utils';
import {
  CompanySizeCreateRequest,
  CompanySizeDeleteRequest,
  CompanySizeGetOneRequest,
  CompanySizeListRequest,
  CompanySizeUpdateRequest,
} from 'protos/dist/ads-gen';
import { AdsGenPrismaService } from '../ads-gen-prisma.service';
export class CompanySizeService {
  constructor(
    @Inject()
    private prisma: AdsGenPrismaService,
  ) {}

  async validateCompanySizeExistence(
    company_size_id: number,
  ): Promise<CompanySize> {
    const companySize = await this.prisma.companySize.findUnique({
      where: { id: company_size_id },
    });

    if (!companySize) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'companySize not found',
      });
    }

    return companySize;
  }

  async validateCompanySizesExistence(
    company_size_ids: number[],
  ): Promise<CompanySize[]> {
    const companySizes = await this.prisma.companySize.findMany({
      where: {
        id: { in: company_size_ids },
      },
    });
    if (companySizes.length !== company_size_ids.length) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'One or more companySizes not found',
      });
    }

    return companySizes;
  }

  async createCompanySize(companySizeCreateRequest: CompanySizeCreateRequest) {
    const { name, description, created_by_id } = companySizeCreateRequest;

    const createdCompanySize = await this.prisma.companySize.create({
      data: {
        name,
        description,
        created_by_id,
        updated_by_id: created_by_id,
      },
    });

    return createdCompanySize;
  }

  async getOneCompanySize(companySizeGetOneRequest: CompanySizeGetOneRequest) {
    const { id } = companySizeGetOneRequest;
    return await this.validateCompanySizeExistence(id);
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
      const ownedRecords = await this.prisma.companySize.findMany({
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

  async getListCompanySize(companySizeListRequest: CompanySizeListRequest) {
    const { sort, range, filter, current_user_id } = companySizeListRequest;
    const fields = Object.keys(Prisma.CompanySizeScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.CompanySizeFindManyArgs = {
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

    const companySizes = await this.prisma.companySize.findMany(queryOptions);
    const totalCount = await this.prisma.companySize.count({
      where: queryOptions.where,
    });
    return { companySizes, totalCount };
  }

  async updateCompanySize(companySizeUpdateRequest: CompanySizeUpdateRequest) {
    const { id, name, description, updated_by_id } = companySizeUpdateRequest;

    await this.validateCompanySizeExistence(id);

    const updatedCompanySize = await this.prisma.companySize.update({
      where: { id },
      data: {
        name,
        description,
        updated_by_id,
      },
    });

    return updatedCompanySize;
  }

  async deleteCompanySize(companySizeDeleteRequest: CompanySizeDeleteRequest) {
    const { id, deleted_by_id } = companySizeDeleteRequest;
    await this.validateCompanySizeExistence(id);
    const deletedCompanySize = await this.prisma.companySize.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id,
      },
    });
    return deletedCompanySize;
  }
}
