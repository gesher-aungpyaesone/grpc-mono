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
  TONE_SERVICE_NAME,
  ToneListResponse,
  ToneResponse,
  ToneServiceClient,
} from 'protos/dist/ads-gen';
import { StaffAuthGuard } from '../../guard';
import { LoggedinStaff, StaffPermissionDecorator } from '../../decorator';
import { ToneCreateDto, ToneListDto, ToneUpdateDto } from './dto';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'utils';
import { Staff } from 'protos/dist/auth';

@Controller('ads-tone')
export class ToneController implements OnModuleInit {
  private toneService: ToneServiceClient;
  constructor(@Inject(ADS_GEN_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.toneService =
      this.client.getService<ToneServiceClient>(TONE_SERVICE_NAME);
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-tone', action: 'create' })
  @Post()
  create(
    @Body() staffCreateDto: ToneCreateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<ToneResponse> {
    return this.toneService
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
  getOne(@Param('id') id: number): Observable<ToneResponse> {
    return this.toneService.getOne({ id: +id }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @Get()
  getList(
    @Query() toneListDto: ToneListDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<ToneListResponse> {
    return this.toneService
      .getList({ ...toneListDto, current_user_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-tone', action: 'edit' })
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateToneDto: ToneUpdateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<ToneResponse> {
    return this.toneService
      .update({ ...updateToneDto, updated_by_id: staff.user_id, id: +id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-tone', action: 'delete' })
  @Delete(':id')
  delete(
    @Param('id') id: number,
    @LoggedinStaff() staff: Staff,
  ): Observable<ToneResponse> {
    return this.toneService
      .delete({ id: +id, deleted_by_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }
}
