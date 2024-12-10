import { CompanySizeService } from '@app/ads-gen-prisma/ads-gen';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  COMPANY_SIZE_SERVICE_NAME,
  CompanySizeCreateRequest,
  CompanySizeDeleteRequest,
  CompanySizeGetOneRequest,
  CompanySizeListRequest,
  CompanySizeListResponse,
  CompanySizeResponse,
  CompanySizeUpdateRequest,
} from 'protos/dist/ads-gen';
import { transformTimestamps } from 'utils';

@Controller('company-size')
export class CompanySizeController {
  constructor(private readonly prisma: CompanySizeService) {}
  @GrpcMethod(COMPANY_SIZE_SERVICE_NAME, 'create')
  async create(
    companySizeCreateRequest: CompanySizeCreateRequest,
  ): Promise<CompanySizeResponse> {
    const createdCompanySize = await this.prisma.createCompanySize(
      companySizeCreateRequest,
    );
    const timestamps = transformTimestamps(
      createdCompanySize.created_at,
      createdCompanySize.updated_at,
      createdCompanySize.deleted_at,
    );

    return {
      data: {
        ...createdCompanySize,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(COMPANY_SIZE_SERVICE_NAME, 'getOne')
  async getOne(
    companySizeGetOneRequest: CompanySizeGetOneRequest,
  ): Promise<CompanySizeResponse> {
    const companySize = await this.prisma.getOneCompanySize(
      companySizeGetOneRequest,
    );
    const timestamps = transformTimestamps(
      companySize.created_at,
      companySize.updated_at,
      companySize.deleted_at,
    );

    return {
      data: {
        ...companySize,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(COMPANY_SIZE_SERVICE_NAME, 'getList')
  async getList(
    companySizeListRequest: CompanySizeListRequest,
  ): Promise<CompanySizeListResponse> {
    const { companySizes, totalCount } = await this.prisma.getListCompanySize(
      companySizeListRequest,
    );
    const transformedCompanySizes = companySizes.map((companySize) => {
      const timestamps = transformTimestamps(
        companySize.created_at,
        companySize.updated_at,
        companySize.deleted_at,
      );
      return { ...companySize, ...timestamps };
    });
    return {
      data: transformedCompanySizes,
      total_count: totalCount,
    };
  }

  @GrpcMethod(COMPANY_SIZE_SERVICE_NAME, 'update')
  async update(
    companySizeUpdateRequest: CompanySizeUpdateRequest,
  ): Promise<CompanySizeResponse> {
    const updatedCompanySize = await this.prisma.updateCompanySize(
      companySizeUpdateRequest,
    );
    const timestamps = transformTimestamps(
      updatedCompanySize.created_at,
      updatedCompanySize.updated_at,
      updatedCompanySize.deleted_at,
    );

    return {
      data: {
        ...updatedCompanySize,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(COMPANY_SIZE_SERVICE_NAME, 'delete')
  async delete(
    companySizeDeleteRequest: CompanySizeDeleteRequest,
  ): Promise<CompanySizeResponse> {
    const deletedCompanySize = await this.prisma.deleteCompanySize(
      companySizeDeleteRequest,
    );
    const timestamps = transformTimestamps(
      deletedCompanySize.created_at,
      deletedCompanySize.updated_at,
      deletedCompanySize.deleted_at,
    );

    return {
      data: {
        ...deletedCompanySize,
        ...timestamps,
      },
    };
  }
}
