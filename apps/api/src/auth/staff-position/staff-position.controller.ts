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
  STAFF_POSITION_SERVICE_NAME,
  StaffPositionListResponse,
  StaffPositionResponse,
  StaffPositionServiceClient,
} from 'protos/dist/auth';
import {
  StaffPositionCreateDto,
  StaffPositionListDto,
  StaffPositionUpdateDto,
} from './dto';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'utils';
import { ApiBearerAuth } from '@nestjs/swagger';
import { StaffAuthGuard } from '../../guard';
import { LoggedinStaff, StaffPermissionDecorator } from '../../decorator';

@Controller('staff-position')
export class StaffPositionController implements OnModuleInit {
  private staffPositionService: StaffPositionServiceClient;
  constructor(@Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.staffPositionService =
      this.client.getService<StaffPositionServiceClient>(
        STAFF_POSITION_SERVICE_NAME,
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'staff-position', action: 'create' })
  @Post()
  create(
    @Body() staffCreateDto: StaffPositionCreateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<StaffPositionResponse> {
    return this.staffPositionService
      .create({ ...staffCreateDto, created_by_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  // @StaffPermissionDecorator({ resource: 'staff', action: 'read' })
  @Get(':id')
  getOne(@Param('id') id: number): Observable<StaffPositionResponse> {
    return this.staffPositionService.getOne({ id: +id }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  // @StaffPermissionDecorator({ resource: 'staff', action: 'read' })
  @Get()
  getList(
    @Query() staffPositionListDto: StaffPositionListDto,
  ): Observable<StaffPositionListResponse> {
    return this.staffPositionService.getList({ ...staffPositionListDto }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'staff-position', action: 'edit' })
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateStaffDto: StaffPositionUpdateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<StaffPositionResponse> {
    return this.staffPositionService
      .update({ ...updateStaffDto, updated_by_id: staff.user_id, id: +id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'staff-position', action: 'delete' })
  @Delete(':id')
  delete(
    @Param('id') id: number,
    @LoggedinStaff() staff: Staff,
  ): Observable<StaffPositionResponse> {
    return this.staffPositionService
      .delete({ id: +id, deleted_by_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }
}
