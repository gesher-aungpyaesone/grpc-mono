import { StaffPositionService } from '@app/prisma/auth';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  STAFF_POSITION_SERVICE_NAME,
  StaffPositionCreateRequest,
  StaffPositionDeleteRequest,
  StaffPositionGetOneRequest,
  StaffPositionListRequest,
  StaffPositionListResponse,
  StaffPositionResponse,
  StaffPositionUpdateRequest,
} from 'protos/dist/auth';
import { transformTimestamps } from 'utils';

@Controller('staff-position')
export class StaffPositionController {
  constructor(private readonly prisma: StaffPositionService) {}
  @GrpcMethod(STAFF_POSITION_SERVICE_NAME, 'create')
  async create(
    staffPositionCreateRequest: StaffPositionCreateRequest,
  ): Promise<StaffPositionResponse> {
    const createdStaffPosition = await this.prisma.createStaffPosition(
      staffPositionCreateRequest,
    );
    const timestamps = transformTimestamps(
      createdStaffPosition.created_at,
      createdStaffPosition.updated_at,
      createdStaffPosition.deleted_at,
    );

    return {
      data: {
        ...createdStaffPosition,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(STAFF_POSITION_SERVICE_NAME, 'getOne')
  async getOne(
    staffPositionGetOneRequest: StaffPositionGetOneRequest,
  ): Promise<StaffPositionResponse> {
    const staffPosition = await this.prisma.getOneStaffPosition(
      staffPositionGetOneRequest,
    );
    const timestamps = transformTimestamps(
      staffPosition.created_at,
      staffPosition.updated_at,
      staffPosition.deleted_at,
    );

    return {
      data: {
        ...staffPosition,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(STAFF_POSITION_SERVICE_NAME, 'getList')
  async getList(
    staffPositionListRequest: StaffPositionListRequest,
  ): Promise<StaffPositionListResponse> {
    const { staffPositions, totalCount } =
      await this.prisma.getListStaffPosition(staffPositionListRequest);
    const transformedStaffPositions = staffPositions.map((staff) => {
      const timestamps = transformTimestamps(
        staff.created_at,
        staff.updated_at,
        staff.deleted_at,
      );
      return { ...staff, ...timestamps };
    });
    return {
      data: transformedStaffPositions,
      total_count: totalCount,
    };
  }

  @GrpcMethod(STAFF_POSITION_SERVICE_NAME, 'update')
  async update(
    staffPositionUpdateRequest: StaffPositionUpdateRequest,
  ): Promise<StaffPositionResponse> {
    const updatedStaffPosition = await this.prisma.updateStaffPosition(
      staffPositionUpdateRequest,
    );
    const timestamps = transformTimestamps(
      updatedStaffPosition.created_at,
      updatedStaffPosition.updated_at,
      updatedStaffPosition.deleted_at,
    );

    return {
      data: {
        ...updatedStaffPosition,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(STAFF_POSITION_SERVICE_NAME, 'delete')
  async delete(
    staffPositionDeleteRequest: StaffPositionDeleteRequest,
  ): Promise<StaffPositionResponse> {
    const deletedStaffPosition = await this.prisma.deleteStaffPosition(
      staffPositionDeleteRequest,
    );
    const timestamps = transformTimestamps(
      deletedStaffPosition.created_at,
      deletedStaffPosition.updated_at,
      deletedStaffPosition.deleted_at,
    );

    return {
      data: {
        ...deletedStaffPosition,
        ...timestamps,
      },
    };
  }
}
