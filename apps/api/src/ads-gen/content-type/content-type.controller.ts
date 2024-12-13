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
  CONTENT_TYPE_SERVICE_NAME,
  ContentTypeListResponse,
  ContentTypeResponse,
  ContentTypeServiceClient,
} from 'protos/dist/ads-gen';
import { StaffAuthGuard } from '../../guard';
import { LoggedinStaff, StaffPermissionDecorator } from '../../decorator';
import {
  ContentTypeCreateDto,
  ContentTypeListDto,
  ContentTypeUpdateDto,
} from './dto';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'utils';
import { Staff } from 'protos/dist/auth';

@Controller('ads-content-type')
export class ContentTypeController implements OnModuleInit {
  private contentTypeService: ContentTypeServiceClient;
  constructor(@Inject(ADS_GEN_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.contentTypeService = this.client.getService<ContentTypeServiceClient>(
      CONTENT_TYPE_SERVICE_NAME,
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-content-type', action: 'create' })
  @Post()
  create(
    @Body() staffCreateDto: ContentTypeCreateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<ContentTypeResponse> {
    return this.contentTypeService
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
  getOne(@Param('id') id: number): Observable<ContentTypeResponse> {
    return this.contentTypeService.getOne({ id: +id }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @Get()
  getList(
    @Query() contentTypeListDto: ContentTypeListDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<ContentTypeListResponse> {
    return this.contentTypeService
      .getList({ ...contentTypeListDto, current_user_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-content-type', action: 'edit' })
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateContentTypeDto: ContentTypeUpdateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<ContentTypeResponse> {
    return this.contentTypeService
      .update({
        ...updateContentTypeDto,
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
  @StaffPermissionDecorator({ resource: 'ads-content-type', action: 'delete' })
  @Delete(':id')
  delete(
    @Param('id') id: number,
    @LoggedinStaff() staff: Staff,
  ): Observable<ContentTypeResponse> {
    return this.contentTypeService
      .delete({ id: +id, deleted_by_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }
}
