import { ClientCompanyService } from '@app/ads-gen-prisma/ads-gen';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CLIENT_COMPANY_SERVICE_NAME,
  ClientCompanyCreateRequest,
  ClientCompanyDeleteRequest,
  ClientCompanyGetOneRequest,
  ClientCompanyListRequest,
  ClientCompanyListResponse,
  ClientCompanyResponse,
  ClientCompanyUpdateRequest,
} from 'protos/dist/ads-gen';
import { transformTimestamps } from 'utils';

@Controller('client-company')
export class ClientCompanyController {
  constructor(private readonly prisma: ClientCompanyService) {}
  @GrpcMethod(CLIENT_COMPANY_SERVICE_NAME, 'create')
  async create(
    clientCompanyCreateRequest: ClientCompanyCreateRequest,
  ): Promise<ClientCompanyResponse> {
    const createdClientCompany = await this.prisma.createClientCompany(
      clientCompanyCreateRequest,
    );
    const timestamps = transformTimestamps(
      createdClientCompany.created_at,
      createdClientCompany.updated_at,
      createdClientCompany.deleted_at,
    );

    return {
      data: {
        ...createdClientCompany,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(CLIENT_COMPANY_SERVICE_NAME, 'getOne')
  async getOne(
    clientCompanyGetOneRequest: ClientCompanyGetOneRequest,
  ): Promise<ClientCompanyResponse> {
    const clientCompany = await this.prisma.getOneClientCompany(
      clientCompanyGetOneRequest,
    );
    const timestamps = transformTimestamps(
      clientCompany.created_at,
      clientCompany.updated_at,
      clientCompany.deleted_at,
    );

    return {
      data: {
        ...clientCompany,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(CLIENT_COMPANY_SERVICE_NAME, 'getList')
  async getList(
    clientCompanyListRequest: ClientCompanyListRequest,
  ): Promise<ClientCompanyListResponse> {
    const { clientCompanies, totalCount } =
      await this.prisma.getListClientCompany(clientCompanyListRequest);
    const transformedClientCompanies = clientCompanies.map((clientCompany) => {
      const timestamps = transformTimestamps(
        clientCompany.created_at,
        clientCompany.updated_at,
        clientCompany.deleted_at,
      );
      return { ...clientCompany, ...timestamps };
    });
    return {
      data: transformedClientCompanies,
      total_count: totalCount,
    };
  }

  @GrpcMethod(CLIENT_COMPANY_SERVICE_NAME, 'update')
  async update(
    clientCompanyUpdateRequest: ClientCompanyUpdateRequest,
  ): Promise<ClientCompanyResponse> {
    const updatedClientCompany = await this.prisma.updateClientCompany(
      clientCompanyUpdateRequest,
    );
    const timestamps = transformTimestamps(
      updatedClientCompany.created_at,
      updatedClientCompany.updated_at,
      updatedClientCompany.deleted_at,
    );

    return {
      data: {
        ...updatedClientCompany,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(CLIENT_COMPANY_SERVICE_NAME, 'delete')
  async delete(
    clientCompanyDeleteRequest: ClientCompanyDeleteRequest,
  ): Promise<ClientCompanyResponse> {
    const deletedClientCompany = await this.prisma.deleteClientCompany(
      clientCompanyDeleteRequest,
    );
    const timestamps = transformTimestamps(
      deletedClientCompany.created_at,
      deletedClientCompany.updated_at,
      deletedClientCompany.deleted_at,
    );

    return {
      data: {
        ...deletedClientCompany,
        ...timestamps,
      },
    };
  }
}
