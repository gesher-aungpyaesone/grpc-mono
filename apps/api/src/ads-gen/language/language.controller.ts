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
  LANGUAGE_SERVICE_NAME,
  LanguageListResponse,
  LanguageResponse,
  LanguageServiceClient,
} from 'protos/dist/ads-gen';
import { StaffAuthGuard } from '../../guard';
import { LoggedinStaff, StaffPermissionDecorator } from '../../decorator';
import { LanguageCreateDto, LanguageListDto, LanguageUpdateDto } from './dto';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'utils';
import { Staff } from 'protos/dist/auth';

@Controller('ads-language')
export class LanguageController implements OnModuleInit {
  private languageService: LanguageServiceClient;
  constructor(@Inject(ADS_GEN_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.languageService = this.client.getService<LanguageServiceClient>(
      LANGUAGE_SERVICE_NAME,
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-language', action: 'create' })
  @Post()
  create(
    @Body() staffCreateDto: LanguageCreateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<LanguageResponse> {
    return this.languageService
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
  getOne(@Param('id') id: number): Observable<LanguageResponse> {
    return this.languageService.getOne({ id: +id }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @Get()
  getList(
    @Query() languageListDto: LanguageListDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<LanguageListResponse> {
    return this.languageService
      .getList({ ...languageListDto, current_user_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-language', action: 'edit' })
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateLanguageDto: LanguageUpdateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<LanguageResponse> {
    return this.languageService
      .update({ ...updateLanguageDto, updated_by_id: staff.user_id, id: +id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-language', action: 'delete' })
  @Delete(':id')
  delete(
    @Param('id') id: number,
    @LoggedinStaff() staff: Staff,
  ): Observable<LanguageResponse> {
    return this.languageService
      .delete({ id: +id, deleted_by_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }
}
