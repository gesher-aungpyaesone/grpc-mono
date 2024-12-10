import { CompanyTypeService } from '@app/ads-gen-prisma/ads-gen';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  COMPANY_TYPE_SERVICE_NAME,
  CompanyTypeCreateRequest,
  CompanyTypeDeleteRequest,
  CompanyTypeGetOneRequest,
  CompanyTypeListRequest,
  CompanyTypeListResponse,
  CompanyTypeResponse,
  CompanyTypeUpdateRequest,
} from 'protos/dist/ads-gen';
import { transformTimestamps } from 'utils';

@Controller('company-size')
export class CompanyTypeController {
  constructor(private readonly prisma: CompanyTypeService) {}
  @GrpcMethod(COMPANY_TYPE_SERVICE_NAME, 'create')
  async create(
    companyTypeCreateRequest: CompanyTypeCreateRequest,
  ): Promise<CompanyTypeResponse> {
    const createdCompanyType = await this.prisma.createCompanyType(
      companyTypeCreateRequest,
    );
    const timestamps = transformTimestamps(
      createdCompanyType.created_at,
      createdCompanyType.updated_at,
      createdCompanyType.deleted_at,
    );

    return {
      data: {
        ...createdCompanyType,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(COMPANY_TYPE_SERVICE_NAME, 'getOne')
  async getOne(
    companyTypeGetOneRequest: CompanyTypeGetOneRequest,
  ): Promise<CompanyTypeResponse> {
    const companyType = await this.prisma.getOneCompanyType(
      companyTypeGetOneRequest,
    );
    const timestamps = transformTimestamps(
      companyType.created_at,
      companyType.updated_at,
      companyType.deleted_at,
    );

    return {
      data: {
        ...companyType,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(COMPANY_TYPE_SERVICE_NAME, 'getList')
  async getList(
    companyTypeListRequest: CompanyTypeListRequest,
  ): Promise<CompanyTypeListResponse> {
    const { companyTypes, totalCount } = await this.prisma.getListCompanyType(
      companyTypeListRequest,
    );
    const transformedCompanyTypes = companyTypes.map((companyType) => {
      const timestamps = transformTimestamps(
        companyType.created_at,
        companyType.updated_at,
        companyType.deleted_at,
      );
      return { ...companyType, ...timestamps };
    });
    return {
      data: transformedCompanyTypes,
      total_count: totalCount,
    };
  }

  @GrpcMethod(COMPANY_TYPE_SERVICE_NAME, 'update')
  async update(
    companyTypeUpdateRequest: CompanyTypeUpdateRequest,
  ): Promise<CompanyTypeResponse> {
    const updatedCompanyType = await this.prisma.updateCompanyType(
      companyTypeUpdateRequest,
    );
    const timestamps = transformTimestamps(
      updatedCompanyType.created_at,
      updatedCompanyType.updated_at,
      updatedCompanyType.deleted_at,
    );

    return {
      data: {
        ...updatedCompanyType,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(COMPANY_TYPE_SERVICE_NAME, 'delete')
  async delete(
    companyTypeDeleteRequest: CompanyTypeDeleteRequest,
  ): Promise<CompanyTypeResponse> {
    const deletedCompanyType = await this.prisma.deleteCompanyType(
      companyTypeDeleteRequest,
    );
    const timestamps = transformTimestamps(
      deletedCompanyType.created_at,
      deletedCompanyType.updated_at,
      deletedCompanyType.deleted_at,
    );

    return {
      data: {
        ...deletedCompanyType,
        ...timestamps,
      },
    };
  }
}
