import { StaffGroupService } from '@app/auth-prisma/auth';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  STAFF_GROUP_SERVICE_NAME,
  StaffGroupAssignRequest,
  StaffGroupDeleteRequest,
  StaffGroupListRequest,
  StaffGroupListResponse,
  StaffGroupResponse,
} from 'protos/dist/auth';
import { transformTimestamps } from 'utils';

@Controller('staff-group')
export class StaffGroupController {
  constructor(private readonly prisma: StaffGroupService) {}

  @GrpcMethod(STAFF_GROUP_SERVICE_NAME, 'assign') async assign(
    staffGroupAssignRequest: StaffGroupAssignRequest,
  ): Promise<StaffGroupResponse> {
    const createdStaffGroup = await this.prisma.assignStaffGroup(
      staffGroupAssignRequest,
    );

    const timestamps = transformTimestamps(
      createdStaffGroup.created_at,
      null,
      null,
    );

    return {
      data: {
        ...createdStaffGroup,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(STAFF_GROUP_SERVICE_NAME, 'getList')
  async getList(
    staffGroupListRequest: StaffGroupListRequest,
  ): Promise<StaffGroupListResponse> {
    const { staffGroups, totalCount } = await this.prisma.getListStaffGroup(
      staffGroupListRequest,
    );
    const transformedStaffGroups = staffGroups.map((staffGroup) => {
      const timestamps = transformTimestamps(staffGroup.created_at, null, null);
      return { ...staffGroup, ...timestamps };
    });

    return {
      data: transformedStaffGroups,
      total_count: totalCount,
    };
  }

  @GrpcMethod(STAFF_GROUP_SERVICE_NAME, 'delete')
  async delete(
    staffGroupDeleteRequest: StaffGroupDeleteRequest,
  ): Promise<StaffGroupResponse> {
    const deletedStaffGroup = await this.prisma.deleteStaffGroup(
      staffGroupDeleteRequest,
    );
    const timestamps = transformTimestamps(
      deletedStaffGroup.created_at,
      null,
      null,
    );

    return {
      data: {
        ...deletedStaffGroup,
        ...timestamps,
      },
    };
  }
}
