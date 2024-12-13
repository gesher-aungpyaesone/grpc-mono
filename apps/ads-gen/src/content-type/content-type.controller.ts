import { ContentTypeService } from '@app/ads-gen-prisma/ads-gen';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CONTENT_TYPE_SERVICE_NAME,
  ContentTypeCreateRequest,
  ContentTypeDeleteRequest,
  ContentTypeGetOneRequest,
  ContentTypeListRequest,
  ContentTypeListResponse,
  ContentTypeResponse,
  ContentTypeUpdateRequest,
} from 'protos/dist/ads-gen';
import { transformTimestamps } from 'utils';

@Controller('content-size')
export class ContentTypeController {
  constructor(private readonly prisma: ContentTypeService) {}
  @GrpcMethod(CONTENT_TYPE_SERVICE_NAME, 'create')
  async create(
    contentTypeCreateRequest: ContentTypeCreateRequest,
  ): Promise<ContentTypeResponse> {
    const createdContentType = await this.prisma.createContentType(
      contentTypeCreateRequest,
    );
    const timestamps = transformTimestamps(
      createdContentType.created_at,
      createdContentType.updated_at,
      createdContentType.deleted_at,
    );

    return {
      data: {
        ...createdContentType,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(CONTENT_TYPE_SERVICE_NAME, 'getOne')
  async getOne(
    contentTypeGetOneRequest: ContentTypeGetOneRequest,
  ): Promise<ContentTypeResponse> {
    const contentType = await this.prisma.getOneContentType(
      contentTypeGetOneRequest,
    );
    const timestamps = transformTimestamps(
      contentType.created_at,
      contentType.updated_at,
      contentType.deleted_at,
    );

    return {
      data: {
        ...contentType,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(CONTENT_TYPE_SERVICE_NAME, 'getList')
  async getList(
    contentTypeListRequest: ContentTypeListRequest,
  ): Promise<ContentTypeListResponse> {
    const { contentTypes, totalCount } = await this.prisma.getListContentType(
      contentTypeListRequest,
    );
    const transformedContentTypes = contentTypes.map((contentType) => {
      const timestamps = transformTimestamps(
        contentType.created_at,
        contentType.updated_at,
        contentType.deleted_at,
      );
      return { ...contentType, ...timestamps };
    });
    return {
      data: transformedContentTypes,
      total_count: totalCount,
    };
  }

  @GrpcMethod(CONTENT_TYPE_SERVICE_NAME, 'update')
  async update(
    contentTypeUpdateRequest: ContentTypeUpdateRequest,
  ): Promise<ContentTypeResponse> {
    const updatedContentType = await this.prisma.updateContentType(
      contentTypeUpdateRequest,
    );
    const timestamps = transformTimestamps(
      updatedContentType.created_at,
      updatedContentType.updated_at,
      updatedContentType.deleted_at,
    );

    return {
      data: {
        ...updatedContentType,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(CONTENT_TYPE_SERVICE_NAME, 'delete')
  async delete(
    contentTypeDeleteRequest: ContentTypeDeleteRequest,
  ): Promise<ContentTypeResponse> {
    const deletedContentType = await this.prisma.deleteContentType(
      contentTypeDeleteRequest,
    );
    const timestamps = transformTimestamps(
      deletedContentType.created_at,
      deletedContentType.updated_at,
      deletedContentType.deleted_at,
    );

    return {
      data: {
        ...deletedContentType,
        ...timestamps,
      },
    };
  }
}
