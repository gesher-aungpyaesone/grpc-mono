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
  STAFF_POSITION_SERVICE_NAME,
  StaffPositionListResponse,
  StaffPositionResponse,
  StaffPositionServiceClient,
} from 'protos/dist/auth';
import {
  StaffPositionCreateDto,
  StaffPositionListDto,
  StaffPositionUpdateDto,
} from './dto';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'utils';

@Controller('staff-position')
export class StaffPositionController implements OnModuleInit {
  private staffPositionService: StaffPositionServiceClient;
  constructor(@Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.staffPositionService =
      this.client.getService<StaffPositionServiceClient>(
        STAFF_POSITION_SERVICE_NAME,
      );
  }

  @Post()
  create(
    @Body() staffCreateDto: StaffPositionCreateDto,
  ): Observable<StaffPositionResponse> {
    return this.staffPositionService
      .create({ ...staffCreateDto, created_by_id: 1 }) // TODO: update created by id
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @Get(':id')
  getOne(@Param('id') id: number): Observable<StaffPositionResponse> {
    return this.staffPositionService.getOne({ id: +id }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @Get()
  getList(
    @Query() staffPositionListDto: StaffPositionListDto,
  ): Observable<StaffPositionListResponse> {
    return this.staffPositionService.getList({ ...staffPositionListDto }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateStaffDto: StaffPositionUpdateDto,
  ): Observable<StaffPositionResponse> {
    return this.staffPositionService
      .update({ ...updateStaffDto, updated_by_id: 1, id: +id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @Delete(':id')
  delete(@Param('id') id: number): Observable<StaffPositionResponse> {
    return this.staffPositionService.delete({ id: +id }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }
}
