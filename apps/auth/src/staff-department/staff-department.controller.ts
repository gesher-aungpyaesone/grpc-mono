import { StaffDepartmentService } from '@app/prisma/auth';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  STAFF_DEPARTMENT_SERVICE_NAME,
  StaffDepartmentCreateRequest,
  StaffDepartmentDeleteRequest,
  StaffDepartmentGetOneRequest,
  StaffDepartmentListRequest,
  StaffDepartmentListResponse,
  StaffDepartmentResponse,
  StaffDepartmentUpdateRequest,
} from 'protos/dist/auth';
import { transformTimestamps } from 'utils';

@Controller('staff-department')
export class StaffDepartmentController {
  constructor(private readonly prisma: StaffDepartmentService) {}
  @GrpcMethod(STAFF_DEPARTMENT_SERVICE_NAME, 'create')
  async create(
    staffDepartmentCreateRequest: StaffDepartmentCreateRequest,
  ): Promise<StaffDepartmentResponse> {
    const createdStaffDepartment = await this.prisma.createStaffDepartment(
      staffDepartmentCreateRequest,
    );
    const timestamps = transformTimestamps(
      createdStaffDepartment.created_at,
      createdStaffDepartment.updated_at,
      createdStaffDepartment.deleted_at,
    );

    return {
      data: {
        ...createdStaffDepartment,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(STAFF_DEPARTMENT_SERVICE_NAME, 'getOne')
  async getOne(
    staffDepartmentGetOneRequest: StaffDepartmentGetOneRequest,
  ): Promise<StaffDepartmentResponse> {
    const staffDepartment = await this.prisma.getOneStaffDepartment(
      staffDepartmentGetOneRequest,
    );
    const timestamps = transformTimestamps(
      staffDepartment.created_at,
      staffDepartment.updated_at,
      staffDepartment.deleted_at,
    );

    return {
      data: {
        ...staffDepartment,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(STAFF_DEPARTMENT_SERVICE_NAME, 'getList')
  async getList(
    staffDepartmentListRequest: StaffDepartmentListRequest,
  ): Promise<StaffDepartmentListResponse> {
    const { staffDepartments, totalCount } =
      await this.prisma.getListStaffDepartment(staffDepartmentListRequest);
    const transformedStaffDepartments = staffDepartments.map((staff) => {
      const timestamps = transformTimestamps(
        staff.created_at,
        staff.updated_at,
        staff.deleted_at,
      );
      return { ...staff, ...timestamps };
    });
    return {
      data: transformedStaffDepartments,
      total_count: totalCount,
    };
  }

  @GrpcMethod(STAFF_DEPARTMENT_SERVICE_NAME, 'update')
  async update(
    staffDepartmentUpdateRequest: StaffDepartmentUpdateRequest,
  ): Promise<StaffDepartmentResponse> {
    const updatedStaffDepartment = await this.prisma.updateStaffDepartment(
      staffDepartmentUpdateRequest,
    );
    const timestamps = transformTimestamps(
      updatedStaffDepartment.created_at,
      updatedStaffDepartment.updated_at,
      updatedStaffDepartment.deleted_at,
    );

    return {
      data: {
        ...updatedStaffDepartment,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(STAFF_DEPARTMENT_SERVICE_NAME, 'delete')
  async delete(
    staffDepartmentDeleteRequest: StaffDepartmentDeleteRequest,
  ): Promise<StaffDepartmentResponse> {
    const deletedStaffDepartment = await this.prisma.deleteStaffDepartment(
      staffDepartmentDeleteRequest,
    );
    const timestamps = transformTimestamps(
      deletedStaffDepartment.created_at,
      deletedStaffDepartment.updated_at,
      deletedStaffDepartment.deleted_at,
    );

    return {
      data: {
        ...deletedStaffDepartment,
        ...timestamps,
      },
    };
  }
}
