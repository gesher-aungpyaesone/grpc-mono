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
  STAFF_SERVICE_NAME,
  StaffListResponse,
  StaffResponse,
  StaffServiceClient,
} from 'protos/dist/auth';
import { Observable, catchError } from 'rxjs';
import { StaffCreateDto, StaffListDto, StaffUpdateDto } from './dto';
import { handleError } from 'utils';
import { ApiBearerAuth } from '@nestjs/swagger';
import { StaffAuthGuard } from '../../guard';
import { LoggedinStaff, StaffPermissionDecorator } from '../../decorator';

@Controller('staff')
export class StaffController implements OnModuleInit {
  private staffService: StaffServiceClient;
  constructor(@Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.staffService =
      this.client.getService<StaffServiceClient>(STAFF_SERVICE_NAME);
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'staff', action: 'create' })
  @Post()
  create(
    @Body() staffCreateDto: StaffCreateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<StaffResponse> {
    return this.staffService
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
  getOne(@Param('id') id: number): Observable<StaffResponse> {
    return this.staffService.getOne({ id: +id }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @Get()
  getList(@Query() staffListDto: StaffListDto): Observable<StaffListResponse> {
    return this.staffService.getList({ ...staffListDto }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'staff', action: 'edit' })
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateStaffDto: StaffUpdateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<StaffResponse> {
    return this.staffService
      .update({ ...updateStaffDto, updated_by_id: staff.user_id, id: +id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'staff', action: 'delete' })
  @Delete(':id')
  delete(
    @Param('id') id: number,
    @LoggedinStaff() staff: Staff,
  ): Observable<StaffResponse> {
    return this.staffService
      .delete({ id: +id, deleted_by_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }
}
