import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Post,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  AUTH_PACKAGE_NAME,
  STAFF_PERMISSION_SERVICE_NAME,
  StaffPermissionListResponse,
  StaffPermissionServiceClient,
} from 'protos/dist/auth';
import { StaffPermissionAssignDto } from './dto';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'utils';

@Controller('staff-permission')
export class StaffPermissionController implements OnModuleInit {
  private staffPermissionService: StaffPermissionServiceClient;
  constructor(@Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.staffPermissionService =
      this.client.getService<StaffPermissionServiceClient>(
        STAFF_PERMISSION_SERVICE_NAME,
      );
  }

  @Post()
  create(
    @Body() staffPermissionAssignDto: StaffPermissionAssignDto,
  ): Observable<StaffPermissionListResponse> {
    return this.staffPermissionService
      .assign({ ...staffPermissionAssignDto, created_by_id: 1 }) // TODO: update created by id
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @Get('by/:staff_id')
  getListByStaff(
    @Param('staff_id') staff_id: number,
  ): Observable<StaffPermissionListResponse> {
    return this.staffPermissionService
      .getListByStaff({ staff_id: +staff_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }
}
