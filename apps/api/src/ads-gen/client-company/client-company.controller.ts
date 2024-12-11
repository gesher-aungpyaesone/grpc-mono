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
  CLIENT_COMPANY_SERVICE_NAME,
  ClientCompanyListResponse,
  ClientCompanyResponse,
  ClientCompanyServiceClient,
} from 'protos/dist/ads-gen';
import { StaffAuthGuard } from '../../guard';
import { LoggedinStaff, StaffPermissionDecorator } from '../../decorator';
import {
  ClientCompanyCreateDto,
  ClientCompanyListDto,
  ClientCompanyUpdateDto,
} from './dto';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'utils';
import { Staff } from 'protos/dist/auth';

@Controller('ads-client-company')
export class ClientCompanyController implements OnModuleInit {
  private clientCompanyService: ClientCompanyServiceClient;
  constructor(@Inject(ADS_GEN_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.clientCompanyService =
      this.client.getService<ClientCompanyServiceClient>(
        CLIENT_COMPANY_SERVICE_NAME,
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({
    resource: 'ads-client-company',
    action: 'create',
  })
  @Post()
  create(
    @Body() staffCreateDto: ClientCompanyCreateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<ClientCompanyResponse> {
    return this.clientCompanyService
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
  getOne(@Param('id') id: number): Observable<ClientCompanyResponse> {
    return this.clientCompanyService.getOne({ id: +id }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @Get()
  getList(
    @Query() clientCompanyListDto: ClientCompanyListDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<ClientCompanyListResponse> {
    return this.clientCompanyService
      .getList({ ...clientCompanyListDto, current_user_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'ads-client-company', action: 'edit' })
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateClientCompanyDto: ClientCompanyUpdateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<ClientCompanyResponse> {
    return this.clientCompanyService
      .update({
        ...updateClientCompanyDto,
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
  @StaffPermissionDecorator({
    resource: 'ads-client-company',
    action: 'delete',
  })
  @Delete(':id')
  delete(
    @Param('id') id: number,
    @LoggedinStaff() staff: Staff,
  ): Observable<ClientCompanyResponse> {
    return this.clientCompanyService
      .delete({ id: +id, deleted_by_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }
}
