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
  TARGET_SERVICE_NAME,
  TargetListResponse,
  TargetResponse,
  TargetServiceClient,
} from 'protos/dist/ads-gen';
import { StaffAuthGuard } from '../../guard';
import { LoggedinStaff, StaffPermissionDecorator } from '../../decorator';
import { TargetCreateDto, TargetListDto, TargetUpdateDto } from './dto';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'utils';
import { Staff } from 'protos/dist/auth';

@Controller('ads-target')
export class TargetController implements OnModuleInit {
  private targetService: TargetServiceClient;
  constructor(@Inject(ADS_GEN_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.targetService =
      this.client.getService<TargetServiceClient>(TARGET_SERVICE_NAME);
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-target', action: 'create' })
  @Post()
  create(
    @Body() staffCreateDto: TargetCreateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<TargetResponse> {
    return this.targetService
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
  getOne(@Param('id') id: number): Observable<TargetResponse> {
    return this.targetService.getOne({ id: +id }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @Get()
  getList(
    @Query() targetListDto: TargetListDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<TargetListResponse> {
    return this.targetService
      .getList({ ...targetListDto, current_user_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-target', action: 'edit' })
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateTargetDto: TargetUpdateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<TargetResponse> {
    return this.targetService
      .update({ ...updateTargetDto, updated_by_id: staff.user_id, id: +id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-target', action: 'delete' })
  @Delete(':id')
  delete(
    @Param('id') id: number,
    @LoggedinStaff() staff: Staff,
  ): Observable<TargetResponse> {
    return this.targetService
      .delete({ id: +id, deleted_by_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }
}
