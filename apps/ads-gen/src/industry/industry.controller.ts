import { IndustryService } from '@app/ads-gen-prisma/ads-gen';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  INDUSTRY_SERVICE_NAME,
  IndustryCreateRequest,
  IndustryDeleteRequest,
  IndustryGetOneRequest,
  IndustryListRequest,
  IndustryListResponse,
  IndustryResponse,
  IndustryUpdateRequest,
} from 'protos/dist/ads-gen';
import { transformTimestamps } from 'utils';

@Controller('industry')
export class IndustryController {
  constructor(private readonly prisma: IndustryService) {}
  @GrpcMethod(INDUSTRY_SERVICE_NAME, 'create')
  async create(
    industryCreateRequest: IndustryCreateRequest,
  ): Promise<IndustryResponse> {
    const createdIndustry = await this.prisma.createIndustry(
      industryCreateRequest,
    );
    const timestamps = transformTimestamps(
      createdIndustry.created_at,
      createdIndustry.updated_at,
      createdIndustry.deleted_at,
    );

    return {
      data: {
        ...createdIndustry,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(INDUSTRY_SERVICE_NAME, 'getOne')
  async getOne(
    industryGetOneRequest: IndustryGetOneRequest,
  ): Promise<IndustryResponse> {
    const industry = await this.prisma.getOneIndustry(industryGetOneRequest);
    const timestamps = transformTimestamps(
      industry.created_at,
      industry.updated_at,
      industry.deleted_at,
    );

    return {
      data: {
        ...industry,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(INDUSTRY_SERVICE_NAME, 'getList')
  async getList(
    industryListRequest: IndustryListRequest,
  ): Promise<IndustryListResponse> {
    const { industrys, totalCount } =
      await this.prisma.getListIndustry(industryListRequest);
    const transformedIndustrys = industrys.map((industry) => {
      const timestamps = transformTimestamps(
        industry.created_at,
        industry.updated_at,
        industry.deleted_at,
      );
      return { ...industry, ...timestamps };
    });
    return {
      data: transformedIndustrys,
      total_count: totalCount,
    };
  }

  @GrpcMethod(INDUSTRY_SERVICE_NAME, 'update')
  async update(
    industryUpdateRequest: IndustryUpdateRequest,
  ): Promise<IndustryResponse> {
    const updatedIndustry = await this.prisma.updateIndustry(
      industryUpdateRequest,
    );
    const timestamps = transformTimestamps(
      updatedIndustry.created_at,
      updatedIndustry.updated_at,
      updatedIndustry.deleted_at,
    );

    return {
      data: {
        ...updatedIndustry,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(INDUSTRY_SERVICE_NAME, 'delete')
  async delete(
    industryDeleteRequest: IndustryDeleteRequest,
  ): Promise<IndustryResponse> {
    const deletedIndustry = await this.prisma.deleteIndustry(
      industryDeleteRequest,
    );
    const timestamps = transformTimestamps(
      deletedIndustry.created_at,
      deletedIndustry.updated_at,
      deletedIndustry.deleted_at,
    );

    return {
      data: {
        ...deletedIndustry,
        ...timestamps,
      },
    };
  }
}
