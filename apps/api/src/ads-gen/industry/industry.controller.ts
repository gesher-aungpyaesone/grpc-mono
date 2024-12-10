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
  INDUSTRY_SERVICE_NAME,
  IndustryListResponse,
  IndustryResponse,
  IndustryServiceClient,
} from 'protos/dist/ads-gen';
import { StaffAuthGuard } from '../../guard';
import { LoggedinStaff, StaffPermissionDecorator } from '../../decorator';
import { IndustryCreateDto, IndustryListDto, IndustryUpdateDto } from './dto';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'utils';
import { Staff } from 'protos/dist/auth';

@Controller('ads-industry')
export class IndustryController implements OnModuleInit {
  private industryService: IndustryServiceClient;
  constructor(@Inject(ADS_GEN_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.industryService = this.client.getService<IndustryServiceClient>(
      INDUSTRY_SERVICE_NAME,
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-industry', action: 'create' })
  @Post()
  create(
    @Body() staffCreateDto: IndustryCreateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<IndustryResponse> {
    return this.industryService
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
  getOne(@Param('id') id: number): Observable<IndustryResponse> {
    return this.industryService.getOne({ id: +id }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @Get()
  getList(
    @Query() industryListDto: IndustryListDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<IndustryListResponse> {
    return this.industryService
      .getList({ ...industryListDto, current_user_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-industry', action: 'edit' })
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateIndustryDto: IndustryUpdateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<IndustryResponse> {
    return this.industryService
      .update({ ...updateIndustryDto, updated_by_id: staff.user_id, id: +id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-industry', action: 'delete' })
  @Delete(':id')
  delete(
    @Param('id') id: number,
    @LoggedinStaff() staff: Staff,
  ): Observable<IndustryResponse> {
    return this.industryService
      .delete({ id: +id, deleted_by_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }
}
