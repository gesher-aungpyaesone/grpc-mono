import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  STAFF_SERVICE_NAME,
  StaffCreateRequest,
  StaffResponse,
} from 'protos/dist/auth';
import { AuthPrismaService } from '@app/prisma/auth-prisma.service';
import { transformTimestamps } from 'utils';

@Controller('staff')
export class StaffController {
  constructor(private readonly prisma: AuthPrismaService) {}

  @GrpcMethod(STAFF_SERVICE_NAME, 'create')
  async create(staffCreateRequest: StaffCreateRequest): Promise<StaffResponse> {
    const createdStaff = await this.prisma.createStaff(staffCreateRequest);
    const timestamps = transformTimestamps(
      createdStaff.created_at,
      createdStaff.updated_at,
      createdStaff.deleted_at,
    );

    return {
      staff: {
        ...createdStaff,
        ...timestamps,
      },
    };
  }
}
