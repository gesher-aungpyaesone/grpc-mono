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
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  ADS_GEN_PACKAGE_NAME,
  PLATFORM_SERVICE_NAME,
  PlatformListResponse,
  PlatformResponse,
  PlatformServiceClient,
} from 'protos/dist/ads-gen';
import { StaffAuthGuard } from '../../guard';
import { LoggedinStaff, StaffPermissionDecorator } from '../../decorator';
import { PlatformCreateDto, PlatformListDto, PlatformUpdateDto } from './dto';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'utils';
import { Staff } from 'protos/dist/auth';

@Controller('ads-platform')
export class PlatformController implements OnModuleInit {
  private platformService: PlatformServiceClient;
  constructor(@Inject(ADS_GEN_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.platformService = this.client.getService<PlatformServiceClient>(
      PLATFORM_SERVICE_NAME,
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-platform', action: 'create' })
  @Post()
  create(
    @Body() staffCreateDto: PlatformCreateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<PlatformResponse> {
    return this.platformService
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
  getOne(@Param('id') id: number): Observable<PlatformResponse> {
    return this.platformService.getOne({ id: +id }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @Get()
  getList(
    @Query() platformListDto: PlatformListDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<PlatformListResponse> {
    return this.platformService
      .getList({ ...platformListDto, current_user_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-platform', action: 'edit' })
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateStaffDto: PlatformUpdateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<PlatformResponse> {
    return this.platformService
      .update({ ...updateStaffDto, updated_by_id: staff.user_id, id: +id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-platform', action: 'delete' })
  @Delete(':id')
  delete(
    @Param('id') id: number,
    @LoggedinStaff() staff: Staff,
  ): Observable<PlatformResponse> {
    return this.platformService
      .delete({ id: +id, deleted_by_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }
}
