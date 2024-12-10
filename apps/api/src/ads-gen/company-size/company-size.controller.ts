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
  COMPANY_SIZE_SERVICE_NAME,
  CompanySizeListResponse,
  CompanySizeResponse,
  CompanySizeServiceClient,
} from 'protos/dist/ads-gen';
import { StaffAuthGuard } from '../../guard';
import { LoggedinStaff, StaffPermissionDecorator } from '../../decorator';
import {
  CompanySizeCreateDto,
  CompanySizeListDto,
  CompanySizeUpdateDto,
} from './dto';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'utils';
import { Staff } from 'protos/dist/auth';

@Controller('ads-company-size')
export class CompanySizeController implements OnModuleInit {
  private companySizeService: CompanySizeServiceClient;
  constructor(@Inject(ADS_GEN_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.companySizeService = this.client.getService<CompanySizeServiceClient>(
      COMPANY_SIZE_SERVICE_NAME,
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-company-size', action: 'create' })
  @Post()
  create(
    @Body() staffCreateDto: CompanySizeCreateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<CompanySizeResponse> {
    return this.companySizeService
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
  getOne(@Param('id') id: number): Observable<CompanySizeResponse> {
    return this.companySizeService.getOne({ id: +id }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @Get()
  getList(
    @Query() companySizeListDto: CompanySizeListDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<CompanySizeListResponse> {
    return this.companySizeService
      .getList({ ...companySizeListDto, current_user_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-company-size', action: 'edit' })
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateCompanySizeDto: CompanySizeUpdateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<CompanySizeResponse> {
    return this.companySizeService
      .update({
        ...updateCompanySizeDto,
        updated_by_id: staff.user_id,
        id: +id,
      })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-company-size', action: 'delete' })
  @Delete(':id')
  delete(
    @Param('id') id: number,
    @LoggedinStaff() staff: Staff,
  ): Observable<CompanySizeResponse> {
    return this.companySizeService
      .delete({ id: +id, deleted_by_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }
}
