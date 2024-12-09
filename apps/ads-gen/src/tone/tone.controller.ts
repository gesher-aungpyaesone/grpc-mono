import { ToneService } from '@app/ads-gen-prisma/ads-gen';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  TONE_SERVICE_NAME,
  ToneCreateRequest,
  ToneDeleteRequest,
  ToneGetOneRequest,
  ToneListRequest,
  ToneListResponse,
  ToneResponse,
  ToneUpdateRequest,
} from 'protos/dist/ads-gen';
import { transformTimestamps } from 'utils';

@Controller('tone')
export class ToneController {
  constructor(private readonly prisma: ToneService) {}
  @GrpcMethod(TONE_SERVICE_NAME, 'create')
  async create(toneCreateRequest: ToneCreateRequest): Promise<ToneResponse> {
    const createdTone = await this.prisma.createTone(toneCreateRequest);
    const timestamps = transformTimestamps(
      createdTone.created_at,
      createdTone.updated_at,
      createdTone.deleted_at,
    );

    return {
      data: {
        ...createdTone,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(TONE_SERVICE_NAME, 'getOne')
  async getOne(toneGetOneRequest: ToneGetOneRequest): Promise<ToneResponse> {
    const tone = await this.prisma.getOneTone(toneGetOneRequest);
    const timestamps = transformTimestamps(
      tone.created_at,
      tone.updated_at,
      tone.deleted_at,
    );

    return {
      data: {
        ...tone,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(TONE_SERVICE_NAME, 'getList')
  async getList(toneListRequest: ToneListRequest): Promise<ToneListResponse> {
    const { tones, totalCount } =
      await this.prisma.getListTone(toneListRequest);
    const transformedTones = tones.map((tone) => {
      const timestamps = transformTimestamps(
        tone.created_at,
        tone.updated_at,
        tone.deleted_at,
      );
      return { ...tone, ...timestamps };
    });
    return {
      data: transformedTones,
      total_count: totalCount,
    };
  }

  @GrpcMethod(TONE_SERVICE_NAME, 'update')
  async update(toneUpdateRequest: ToneUpdateRequest): Promise<ToneResponse> {
    const updatedTone = await this.prisma.updateTone(toneUpdateRequest);
    const timestamps = transformTimestamps(
      updatedTone.created_at,
      updatedTone.updated_at,
      updatedTone.deleted_at,
    );

    return {
      data: {
        ...updatedTone,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(TONE_SERVICE_NAME, 'delete')
  async delete(toneDeleteRequest: ToneDeleteRequest): Promise<ToneResponse> {
    const deletedTone = await this.prisma.deleteTone(toneDeleteRequest);
    const timestamps = transformTimestamps(
      deletedTone.created_at,
      deletedTone.updated_at,
      deletedTone.deleted_at,
    );

    return {
      data: {
        ...deletedTone,
        ...timestamps,
      },
    };
  }
}
