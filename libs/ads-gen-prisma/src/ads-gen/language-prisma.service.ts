import { Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma, Language } from '@prisma/ads-gen-ms';
import * as grpc from '@grpc/grpc-js';
import { validateFilter, validateRange, validateSort } from 'utils';
import {
  LanguageCreateRequest,
  LanguageDeleteRequest,
  LanguageGetOneRequest,
  LanguageListRequest,
  LanguageUpdateRequest,
} from 'protos/dist/ads-gen';
import { AdsGenPrismaService } from '../ads-gen-prisma.service';
export class LanguageService {
  constructor(
    @Inject()
    private prisma: AdsGenPrismaService,
  ) {}

  async validateLanguageExistence(language_id: number): Promise<Language> {
    const language = await this.prisma.language.findUnique({
      where: { id: language_id },
    });

    if (!language) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'language not found',
      });
    }

    return language;
  }

  async validateLanguagesExistence(
    language_ids: number[],
  ): Promise<Language[]> {
    const languages = await this.prisma.language.findMany({
      where: {
        id: { in: language_ids },
      },
    });
    if (languages.length !== language_ids.length) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'One or more languages not found',
      });
    }

    return languages;
  }

  async createLanguage(languageCreateRequest: LanguageCreateRequest) {
    const { name, description, created_by_id } = languageCreateRequest;

    const createdLanguage = await this.prisma.language.create({
      data: {
        name,
        description,
        created_by_id,
        updated_by_id: created_by_id,
      },
    });

    return createdLanguage;
  }

  async getOneLanguage(languageGetOneRequest: LanguageGetOneRequest) {
    const { id } = languageGetOneRequest;
    return await this.validateLanguageExistence(id);
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
      const ownedRecords = await this.prisma.language.findMany({
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

  async getListLanguage(languageListRequest: LanguageListRequest) {
    const { sort, range, filter, current_user_id } = languageListRequest;
    const fields = Object.keys(Prisma.LanguageScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.LanguageFindManyArgs = {
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

    const languages = await this.prisma.language.findMany(queryOptions);
    const totalCount = await this.prisma.language.count({
      where: queryOptions.where,
    });
    return { languages, totalCount };
  }

  async updateLanguage(languageUpdateRequest: LanguageUpdateRequest) {
    const { id, name, description, updated_by_id } = languageUpdateRequest;

    await this.validateLanguageExistence(id);

    const updatedLanguage = await this.prisma.language.update({
      where: { id },
      data: {
        name,
        description,
        updated_by_id,
      },
    });

    return updatedLanguage;
  }

  async deleteLanguage(languageDeleteRequest: LanguageDeleteRequest) {
    const { id, deleted_by_id } = languageDeleteRequest;
    await this.validateLanguageExistence(id);
    const deletedLanguage = await this.prisma.language.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id,
      },
    });
    return deletedLanguage;
  }
}
