import { Body, Controller, Inject, OnModuleInit, Post } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  AUTH_PACKAGE_NAME,
  STAFF_SERVICE_NAME,
  StaffResponse,
  StaffServiceClient,
} from 'protos/dist/auth';
import { Observable, catchError } from 'rxjs';
import { StaffCreateDto } from './dto';
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
  create(@Body() createStaffDto: StaffCreateDto): Observable<StaffResponse> {
    return this.staffService
      .create({ ...createStaffDto, created_by_id: 1 })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }
}
