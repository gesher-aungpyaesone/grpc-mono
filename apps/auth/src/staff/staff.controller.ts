import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  STAFF_SERVICE_NAME,
  StaffCreateRequest,
  StaffDeleteRequest,
  StaffGetOneRequest,
  StaffListRequest,
  StaffListResponse,
  StaffResponse,
  StaffUpdateRequest,
} from 'protos/dist/auth';
import { transformTimestamps } from 'utils';
import { StaffService } from '@app/auth-prisma/auth';

@Controller('staff')
export class StaffController {
  constructor(private readonly prisma: StaffService) {}

  @GrpcMethod(STAFF_SERVICE_NAME, 'create')
  async create(staffCreateRequest: StaffCreateRequest): Promise<StaffResponse> {
    const createdStaff = await this.prisma.createStaff(staffCreateRequest);
    const timestamps = transformTimestamps(
      createdStaff.created_at,
      createdStaff.updated_at,
      createdStaff.deleted_at,
    );

    return {
      data: {
        ...createdStaff,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(STAFF_SERVICE_NAME, 'getOne')
  async getOne(staffGetOneRequest: StaffGetOneRequest): Promise<StaffResponse> {
    const staff = await this.prisma.getOneStaff(staffGetOneRequest);
    const timestamps = transformTimestamps(
      staff.created_at,
      staff.updated_at,
      staff.deleted_at,
    );

    return {
      data: {
        ...staff,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(STAFF_SERVICE_NAME, 'getList')
  async getList(
    staffListRequest: StaffListRequest,
  ): Promise<StaffListResponse> {
    const { staffs, totalCount } =
      await this.prisma.getListStaff(staffListRequest);
    const transformedStaffs = staffs.map((staff) => {
      const timestamps = transformTimestamps(
        staff.created_at,
        staff.updated_at,
        staff.deleted_at,
      );
      return { ...staff, ...timestamps };
    });
    return {
      data: transformedStaffs,
      total_count: totalCount,
    };
  }

  @GrpcMethod(STAFF_SERVICE_NAME, 'update')
  async update(staffUpdateRequest: StaffUpdateRequest): Promise<StaffResponse> {
    const updatedStaff = await this.prisma.updateStaff(staffUpdateRequest);
    const timestamps = transformTimestamps(
      updatedStaff.created_at,
      updatedStaff.updated_at,
      updatedStaff.deleted_at,
    );

    return {
      data: {
        ...updatedStaff,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(STAFF_SERVICE_NAME, 'delete')
  async delete(staffDeleteRequest: StaffDeleteRequest): Promise<StaffResponse> {
    const deletedStaff = await this.prisma.deleteStaff(staffDeleteRequest);
    const timestamps = transformTimestamps(
      deletedStaff.created_at,
      deletedStaff.updated_at,
      deletedStaff.deleted_at,
    );

    return {
      data: {
        ...deletedStaff,
        ...timestamps,
      },
    };
  }
}
