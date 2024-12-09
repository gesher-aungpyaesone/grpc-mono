import { LanguageService } from '@app/ads-gen-prisma/ads-gen';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  LANGUAGE_SERVICE_NAME,
  LanguageCreateRequest,
  LanguageDeleteRequest,
  LanguageGetOneRequest,
  LanguageListRequest,
  LanguageListResponse,
  LanguageResponse,
  LanguageUpdateRequest,
} from 'protos/dist/ads-gen';
import { transformTimestamps } from 'utils';

@Controller('language')
export class LanguageController {
  constructor(private readonly prisma: LanguageService) {}
  @GrpcMethod(LANGUAGE_SERVICE_NAME, 'create')
  async create(
    languageCreateRequest: LanguageCreateRequest,
  ): Promise<LanguageResponse> {
    const createdLanguage = await this.prisma.createLanguage(
      languageCreateRequest,
    );
    const timestamps = transformTimestamps(
      createdLanguage.created_at,
      createdLanguage.updated_at,
      createdLanguage.deleted_at,
    );

    return {
      data: {
        ...createdLanguage,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(LANGUAGE_SERVICE_NAME, 'getOne')
  async getOne(
    languageGetOneRequest: LanguageGetOneRequest,
  ): Promise<LanguageResponse> {
    const language = await this.prisma.getOneLanguage(languageGetOneRequest);
    const timestamps = transformTimestamps(
      language.created_at,
      language.updated_at,
      language.deleted_at,
    );

    return {
      data: {
        ...language,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(LANGUAGE_SERVICE_NAME, 'getList')
  async getList(
    languageListRequest: LanguageListRequest,
  ): Promise<LanguageListResponse> {
    const { languages, totalCount } =
      await this.prisma.getListLanguage(languageListRequest);
    const transformedLanguages = languages.map((language) => {
      const timestamps = transformTimestamps(
        language.created_at,
        language.updated_at,
        language.deleted_at,
      );
      return { ...language, ...timestamps };
    });
    return {
      data: transformedLanguages,
      total_count: totalCount,
    };
  }

  @GrpcMethod(LANGUAGE_SERVICE_NAME, 'update')
  async update(
    languageUpdateRequest: LanguageUpdateRequest,
  ): Promise<LanguageResponse> {
    const updatedLanguage = await this.prisma.updateLanguage(
      languageUpdateRequest,
    );
    const timestamps = transformTimestamps(
      updatedLanguage.created_at,
      updatedLanguage.updated_at,
      updatedLanguage.deleted_at,
    );

    return {
      data: {
        ...updatedLanguage,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(LANGUAGE_SERVICE_NAME, 'delete')
  async delete(
    languageDeleteRequest: LanguageDeleteRequest,
  ): Promise<LanguageResponse> {
    const deletedLanguage = await this.prisma.deleteLanguage(
      languageDeleteRequest,
    );
    const timestamps = transformTimestamps(
      deletedLanguage.created_at,
      deletedLanguage.updated_at,
      deletedLanguage.deleted_at,
    );

    return {
      data: {
        ...deletedLanguage,
        ...timestamps,
      },
    };
  }
}
