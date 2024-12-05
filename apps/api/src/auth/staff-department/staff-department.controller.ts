import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  AUTH_PACKAGE_NAME,
  Staff,
  STAFF_DEPARTMENT_SERVICE_NAME,
  StaffDepartmentListResponse,
  StaffDepartmentResponse,
  StaffDepartmentServiceClient,
} from 'protos/dist/auth';
import {
  StaffDepartmentCreateDto,
  StaffDepartmentListDto,
  StaffDepartmentUpdateDto,
} from './dto';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'utils';
import { ApiBearerAuth } from '@nestjs/swagger';
import { StaffAuthGuard } from '../../guard';
import { LoggedinStaff, StaffPermissionDecorator } from '../../decorator';

@Controller('staff-department')
export class StaffDepartmentController implements OnModuleInit {
  private staffDepartmentService: StaffDepartmentServiceClient;
  constructor(@Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.staffDepartmentService =
      this.client.getService<StaffDepartmentServiceClient>(
        STAFF_DEPARTMENT_SERVICE_NAME,
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'staff-department', action: 'create' })
  @Post()
  create(
    @Body() staffCreateDto: StaffDepartmentCreateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<StaffDepartmentResponse> {
    return this.staffDepartmentService
      .create({ ...staffCreateDto, created_by_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @Get(':id')
  getOne(@Param('id') id: number): Observable<StaffDepartmentResponse> {
    return this.staffDepartmentService.getOne({ id: +id }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @Get()
  getList(
    @Query() staffDepartmentListDto: StaffDepartmentListDto,
  ): Observable<StaffDepartmentListResponse> {
    return this.staffDepartmentService
      .getList({ ...staffDepartmentListDto })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'staff-department', action: 'edit' })
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateStaffDto: StaffDepartmentUpdateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<StaffDepartmentResponse> {
    return this.staffDepartmentService
      .update({ ...updateStaffDto, updated_by_id: staff.user_id, id: +id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'staff-department', action: 'delete' })
  @Delete(':id')
  delete(
    @Param('id') id: number,
    @LoggedinStaff() staff: Staff,
  ): Observable<StaffDepartmentResponse> {
    return this.staffDepartmentService
      .delete({ id: +id, deleted_by_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }
}
