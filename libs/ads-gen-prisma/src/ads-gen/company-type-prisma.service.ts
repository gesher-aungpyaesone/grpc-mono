import { Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma, CompanyType } from '@prisma/ads-gen-ms';
import * as grpc from '@grpc/grpc-js';
import { validateFilter, validateRange, validateSort } from 'utils';
import {
  CompanyTypeCreateRequest,
  CompanyTypeDeleteRequest,
  CompanyTypeGetOneRequest,
  CompanyTypeListRequest,
  CompanyTypeUpdateRequest,
} from 'protos/dist/ads-gen';
import { AdsGenPrismaService } from '../ads-gen-prisma.service';
export class CompanyTypeService {
  constructor(
    @Inject()
    private prisma: AdsGenPrismaService,
  ) {}

  async validateCompanyTypeExistence(
    company_type_id: number,
  ): Promise<CompanyType> {
    const companyType = await this.prisma.companyType.findUnique({
      where: { id: company_type_id },
    });

    if (!companyType) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'companyType not found',
      });
    }

    return companyType;
  }

  async validateCompanyTypesExistence(
    company_type_ids: number[],
  ): Promise<CompanyType[]> {
    const companyTypes = await this.prisma.companyType.findMany({
      where: {
        id: { in: company_type_ids },
      },
    });
    if (companyTypes.length !== company_type_ids.length) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'One or more companyTypes not found',
      });
    }

    return companyTypes;
  }

  async createCompanyType(companyTypeCreateRequest: CompanyTypeCreateRequest) {
    const { name, description, created_by_id } = companyTypeCreateRequest;

    const createdCompanyType = await this.prisma.companyType.create({
      data: {
        name,
        description,
        created_by_id,
        updated_by_id: created_by_id,
      },
    });

    return createdCompanyType;
  }

  async getOneCompanyType(companyTypeGetOneRequest: CompanyTypeGetOneRequest) {
    const { id } = companyTypeGetOneRequest;
    return await this.validateCompanyTypeExistence(id);
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
      const ownedRecords = await this.prisma.companyType.findMany({
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

  async getListCompanyType(companyTypeListRequest: CompanyTypeListRequest) {
    const { sort, range, filter, current_user_id } = companyTypeListRequest;
    const fields = Object.keys(Prisma.CompanyTypeScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.CompanyTypeFindManyArgs = {
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

    const companyTypes = await this.prisma.companyType.findMany(queryOptions);
    const totalCount = await this.prisma.companyType.count({
      where: queryOptions.where,
    });
    return { companyTypes, totalCount };
  }

  async updateCompanyType(companyTypeUpdateRequest: CompanyTypeUpdateRequest) {
    const { id, name, description, updated_by_id } = companyTypeUpdateRequest;

    await this.validateCompanyTypeExistence(id);

    const updatedCompanyType = await this.prisma.companyType.update({
      where: { id },
      data: {
        name,
        description,
        updated_by_id,
      },
    });

    return updatedCompanyType;
  }

  async deleteCompanyType(companyTypeDeleteRequest: CompanyTypeDeleteRequest) {
    const { id, deleted_by_id } = companyTypeDeleteRequest;
    await this.validateCompanyTypeExistence(id);
    const deletedCompanyType = await this.prisma.companyType.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id,
      },
    });
    return deletedCompanyType;
  }
}
