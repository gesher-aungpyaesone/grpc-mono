import { StaffService } from '@app/prisma/auth';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  STAFF_AUTH_SERVICE_NAME,
  StaffValidateRequest,
  StaffValidateResponse,
} from 'protos/dist/auth';
import { comparePassword, transformTimestamps } from 'utils';

@Controller('staff-auth')
export class StaffAuthController {
  constructor(private readonly prisma: StaffService) {}

  @GrpcMethod(STAFF_AUTH_SERVICE_NAME, 'validate')
  async validate(
    staffValidateRequest: StaffValidateRequest,
  ): Promise<StaffValidateResponse> {
    const staff = await this.prisma.getOneStaffByEmail(
      staffValidateRequest.email,
    );
    const isMatchPassword = await comparePassword(
      staffValidateRequest.password,
      staff.password,
    );

    delete staff.password;
    const timestamps = transformTimestamps(
      staff.created_at,
      staff.updated_at,
      staff.deleted_at,
    );
    if (isMatchPassword) return { data: { ...staff, ...timestamps } };
    return { data: null };
  }
}
