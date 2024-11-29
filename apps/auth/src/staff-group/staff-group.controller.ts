import { StaffGroupService } from '@app/prisma/auth';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  STAFF_GROUP_SERVICE_NAME,
  StaffGroupListRequest,
  StaffGroupListResponse,
} from 'protos/dist/auth';
import { transformTimestamps } from 'utils';

@Controller('staff-group')
export class StaffGroupController {
  constructor(private readonly prisma: StaffGroupService) {}

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
}
