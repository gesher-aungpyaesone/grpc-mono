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
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  AUTH_PACKAGE_NAME,
  STAFF_SERVICE_NAME,
  StaffListResponse,
  StaffResponse,
  StaffServiceClient,
} from 'protos/dist/auth';
import { Observable, catchError } from 'rxjs';
import { StaffCreateDto, StaffListDto, StaffUpdateDto } from './dto';
import { handleError } from 'utils';

@Controller('staff')
export class StaffController implements OnModuleInit {
  private staffService: StaffServiceClient;
  constructor(@Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.staffService =
      this.client.getService<StaffServiceClient>(STAFF_SERVICE_NAME);
  }

  @Post()
  create(@Body() staffCreateDto: StaffCreateDto): Observable<StaffResponse> {
    return this.staffService
      .create({ ...staffCreateDto, created_by_id: 1 }) // TODO: update created by id
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @Get(':id')
  getOne(@Param('id') id: number): Observable<StaffResponse> {
    return this.staffService.getOne({ id: +id }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @Get()
  getList(@Query() staffListDto: StaffListDto): Observable<StaffListResponse> {
    return this.staffService.getList({ ...staffListDto }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateStaffDto: StaffUpdateDto,
  ): Observable<StaffResponse> {
    return this.staffService
      .update({ ...updateStaffDto, updated_by_id: 1, id: +id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @Delete(':id')
  delete(@Param('id') id: number): Observable<StaffResponse> {
    return this.staffService.delete({ id: +id, deleted_by_id: 1 }).pipe(
      // TODO: update deleted by id
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }
}
