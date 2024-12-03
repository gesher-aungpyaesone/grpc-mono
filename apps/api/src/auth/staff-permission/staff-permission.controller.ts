import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  AUTH_PACKAGE_NAME,
  Staff,
  STAFF_PERMISSION_SERVICE_NAME,
  StaffPermissionListResponse,
  StaffPermissionResponse,
  StaffPermissionServiceClient,
} from 'protos/dist/auth';
import { StaffPermissionAssignDto, StaffPermissionListDto } from './dto';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'utils';
import { ApiBearerAuth } from '@nestjs/swagger';
import { StaffAuthGuard } from '../../guard';
import { LoggedinStaff, StaffPermissionDecorator } from '../../decorator';

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

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'staff', action: 'edit' })
  @Post()
  create(
    @Body() staffPermissionAssignDto: StaffPermissionAssignDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<StaffPermissionResponse> {
    return this.staffPermissionService
      .assign({ ...staffPermissionAssignDto, created_by_id: staff.user_id })
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

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'staff', action: 'edit' })
  @Get()
  getList(
    @Query() staffPermissionListDto: StaffPermissionListDto,
  ): Observable<StaffPermissionListResponse> {
    return this.staffPermissionService
      .getList({ ...staffPermissionListDto })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }
}
