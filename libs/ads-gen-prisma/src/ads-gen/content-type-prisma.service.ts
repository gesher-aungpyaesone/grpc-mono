import { Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma, ContentType } from '@prisma/ads-gen-ms';
import * as grpc from '@grpc/grpc-js';
import { validateFilter, validateRange, validateSort } from 'utils';
import {
  ContentTypeCreateRequest,
  ContentTypeDeleteRequest,
  ContentTypeGetOneRequest,
  ContentTypeListRequest,
  ContentTypeUpdateRequest,
} from 'protos/dist/ads-gen';
import { AdsGenPrismaService } from '../ads-gen-prisma.service';
export class ContentTypeService {
  constructor(
    @Inject()
    private prisma: AdsGenPrismaService,
  ) {}

  async validateContentTypeExistence(
    content_type_id: number,
  ): Promise<ContentType> {
    const contentType = await this.prisma.contentType.findUnique({
      where: { id: content_type_id },
    });

    if (!contentType) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'contentType not found',
      });
    }

    return contentType;
  }

  async validateContentTypesExistence(
    content_type_ids: number[],
  ): Promise<ContentType[]> {
    const contentTypes = await this.prisma.contentType.findMany({
      where: {
        id: { in: content_type_ids },
      },
    });
    if (contentTypes.length !== content_type_ids.length) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'One or more contentTypes not found',
      });
    }

    return contentTypes;
  }

  async createContentType(contentTypeCreateRequest: ContentTypeCreateRequest) {
    const { name, description, created_by_id } = contentTypeCreateRequest;

    const createdContentType = await this.prisma.contentType.create({
      data: {
        name,
        description,
        created_by_id,
        updated_by_id: created_by_id,
      },
    });

    return createdContentType;
  }

  async getOneContentType(contentTypeGetOneRequest: ContentTypeGetOneRequest) {
    const { id } = contentTypeGetOneRequest;
    return await this.validateContentTypeExistence(id);
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
      const ownedRecords = await this.prisma.contentType.findMany({
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

  async getListContentType(contentTypeListRequest: ContentTypeListRequest) {
    const { sort, range, filter, current_user_id } = contentTypeListRequest;
    const fields = Object.keys(Prisma.ContentTypeScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.ContentTypeFindManyArgs = {
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

    const contentTypes = await this.prisma.contentType.findMany(queryOptions);
    const totalCount = await this.prisma.contentType.count({
      where: queryOptions.where,
    });
    return { contentTypes, totalCount };
  }

  async updateContentType(contentTypeUpdateRequest: ContentTypeUpdateRequest) {
    const { id, name, description, updated_by_id } = contentTypeUpdateRequest;

    await this.validateContentTypeExistence(id);

    const updatedContentType = await this.prisma.contentType.update({
      where: { id },
      data: {
        name,
        description,
        updated_by_id,
      },
    });

    return updatedContentType;
  }

  async deleteContentType(contentTypeDeleteRequest: ContentTypeDeleteRequest) {
    const { id, deleted_by_id } = contentTypeDeleteRequest;
    await this.validateContentTypeExistence(id);
    const deletedContentType = await this.prisma.contentType.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id,
      },
    });
    return deletedContentType;
  }
}
