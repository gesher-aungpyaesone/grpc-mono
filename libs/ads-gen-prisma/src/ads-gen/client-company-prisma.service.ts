import { Inject } from '@nestjs/common';
import { AdsGenPrismaService } from '../ads-gen-prisma.service';
import { RpcException } from '@nestjs/microservices';
import { Prisma, ClientCompany } from '@prisma/ads-gen-ms';
import * as grpc from '@grpc/grpc-js';
import {
  ClientCompanyCreateRequest,
  ClientCompanyDeleteRequest,
  ClientCompanyGetOneRequest,
  ClientCompanyListRequest,
  ClientCompanyUpdateRequest,
} from 'protos/dist/ads-gen';
import { validateFilter, validateRange, validateSort } from 'utils';
import { IndustryService } from './industry-prisma.service';
import { CompanyTypeService } from './company-type-prisma.service';
import { CompanySizeService } from './company-size-prisma.service';

export class ClientCompanyService {
  constructor(
    @Inject()
    private prisma: AdsGenPrismaService,
    @Inject()
    private readonly industryService: IndustryService,
    @Inject()
    private readonly companyTypeService: CompanyTypeService,
    @Inject()
    private readonly companySizeService: CompanySizeService,
  ) {}

  async validateClientCompanyNameUniqueness(name: string): Promise<void> {
    const existingClientCompany = await this.prisma.clientCompany.findUnique({
      where: { name },
    });

    if (existingClientCompany) {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: JSON.stringify({ name: 'name must be unique' }),
      });
    }
  }

  async validateClientCompanyExistence(
    client_company_id: number,
  ): Promise<ClientCompany> {
    const clientCompany = await this.prisma.clientCompany.findUnique({
      where: { id: client_company_id },
    });

    if (!clientCompany) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'clientCompany not found',
      });
    }

    return clientCompany;
  }

  async validateClientCompaniesExistence(
    client_company_ids: number[],
  ): Promise<ClientCompany[]> {
    const clientCompanies = await this.prisma.clientCompany.findMany({
      where: {
        id: { in: client_company_ids },
      },
    });
    if (clientCompanies.length !== clientCompanies.length) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'One or more clientCompany not found',
      });
    }

    return clientCompanies;
  }

  async createClientCompany(
    clientCompanyCreateRequest: ClientCompanyCreateRequest,
  ) {
    const {
      name,
      website_url,
      strength,
      others,
      industry_id,
      size_id,
      type_id,
      created_by_id,
    } = clientCompanyCreateRequest;

    await this.validateClientCompanyNameUniqueness(name);
    await this.industryService.validateIndustryExistence(industry_id);
    await this.companyTypeService.validateCompanyTypeExistence(type_id);
    await this.companySizeService.validateCompanySizeExistence(size_id);

    const createdClientCompany = await this.prisma.clientCompany.create({
      data: {
        name,
        website_url,
        strength,
        others,
        industry: { connect: { id: industry_id } },
        type: { connect: { id: type_id } },
        size: { connect: { id: size_id } },
        created_by_id,
        updated_by_id: created_by_id,
      },
    });

    return createdClientCompany;
  }

  async getOneClientCompany(
    clientCompanyGetOneRequest: ClientCompanyGetOneRequest,
  ) {
    const { id } = clientCompanyGetOneRequest;
    return await this.validateClientCompanyExistence(id);
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
      const ownedRecords = await this.prisma.clientCompany.findMany({
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

  async getListClientCompany(
    clientCompanyListRequest: ClientCompanyListRequest,
  ) {
    const { sort, range, filter, current_user_id } = clientCompanyListRequest;
    const fields = Object.keys(Prisma.ClientCompanyScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.ClientCompanyFindManyArgs = {
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

    const clientCompanies =
      await this.prisma.clientCompany.findMany(queryOptions);
    const totalCount = await this.prisma.clientCompany.count({
      where: queryOptions.where,
    });
    return { clientCompanies, totalCount };
  }

  async updateClientCompany(
    ClientCompanyUpdateRequest: ClientCompanyUpdateRequest,
  ) {
    const {
      id,
      name,
      website_url,
      strength,
      others,
      industry_id,
      size_id,
      type_id,
      updated_by_id,
    } = ClientCompanyUpdateRequest;

    const existingClientCompany = await this.validateClientCompanyExistence(id);

    if (existingClientCompany.name !== name)
      await this.validateClientCompanyNameUniqueness(name);
    await this.industryService.validateIndustryExistence(industry_id);
    await this.companyTypeService.validateCompanyTypeExistence(type_id);
    await this.companySizeService.validateCompanySizeExistence(size_id);

    const updatedClientCompany = await this.prisma.clientCompany.update({
      where: { id },
      data: {
        name,
        website_url,
        strength,
        others,
        industry: { connect: { id: industry_id } },
        type: { connect: { id: type_id } },
        size: { connect: { id: size_id } },
        updated_by_id,
      },
    });
    return updatedClientCompany;
  }

  async deleteClientCompany(
    clientCompanyDeleteRequest: ClientCompanyDeleteRequest,
  ) {
    const { id, deleted_by_id } = clientCompanyDeleteRequest;
    await this.validateClientCompanyExistence(id);
    const deletedClientCompany = await this.prisma.clientCompany.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id,
      },
    });
    return deletedClientCompany;
  }
}
