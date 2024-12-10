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
  COMPANY_TYPE_SERVICE_NAME,
  CompanyTypeListResponse,
  CompanyTypeResponse,
  CompanyTypeServiceClient,
} from 'protos/dist/ads-gen';
import { StaffAuthGuard } from '../../guard';
import { LoggedinStaff, StaffPermissionDecorator } from '../../decorator';
import {
  CompanyTypeCreateDto,
  CompanyTypeListDto,
  CompanyTypeUpdateDto,
} from './dto';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'utils';
import { Staff } from 'protos/dist/auth';

@Controller('ads-company-type')
export class CompanyTypeController implements OnModuleInit {
  private companyTypeService: CompanyTypeServiceClient;
  constructor(@Inject(ADS_GEN_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.companyTypeService = this.client.getService<CompanyTypeServiceClient>(
      COMPANY_TYPE_SERVICE_NAME,
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-company-type', action: 'create' })
  @Post()
  create(
    @Body() staffCreateDto: CompanyTypeCreateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<CompanyTypeResponse> {
    return this.companyTypeService
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
  getOne(@Param('id') id: number): Observable<CompanyTypeResponse> {
    return this.companyTypeService.getOne({ id: +id }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @Get()
  getList(
    @Query() companyTypeListDto: CompanyTypeListDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<CompanyTypeListResponse> {
    return this.companyTypeService
      .getList({ ...companyTypeListDto, current_user_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-company-type', action: 'edit' })
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateCompanyTypeDto: CompanyTypeUpdateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<CompanyTypeResponse> {
    return this.companyTypeService
      .update({
        ...updateCompanyTypeDto,
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
  @StaffPermissionDecorator({ resource: 'ads-company-type', action: 'delete' })
  @Delete(':id')
  delete(
    @Param('id') id: number,
    @LoggedinStaff() staff: Staff,
  ): Observable<CompanyTypeResponse> {
    return this.companyTypeService
      .delete({ id: +id, deleted_by_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }
}
