import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  AUTH_PACKAGE_NAME,
  Staff,
  STAFF_GROUP_SERVICE_NAME,
  StaffGroupListResponse,
  StaffGroupResponse,
  StaffGroupServiceClient,
} from 'protos/dist/auth';
import { StaffAuthGuard } from '../../guard';
import { StaffGroupAssignDto, StaffGroupListDto } from './dto';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'utils';
import { LoggedinStaff, StaffPermissionDecorator } from '../../decorator';

@Controller('staff-group')
export class StaffGroupController implements OnModuleInit {
  private staffGroupService: StaffGroupServiceClient;
  constructor(@Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.staffGroupService = this.client.getService<StaffGroupServiceClient>(
      STAFF_GROUP_SERVICE_NAME,
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'staff-group', action: 'assign' })
  @Post()
  create(
    @Body() staffGroupAssignDto: StaffGroupAssignDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<StaffGroupResponse> {
    return this.staffGroupService
      .assign({ ...staffGroupAssignDto, created_by_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'staff-group', action: 'assign' })
  @Delete(':id')
  delete(@Param('id') id: number): Observable<StaffGroupResponse> {
    return this.staffGroupService.delete({ id: +id }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @Get()
  getList(
    @Query() staffGroupListDto: StaffGroupListDto,
  ): Observable<StaffGroupListResponse> {
    return this.staffGroupService.getList({ ...staffGroupListDto }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }
}
