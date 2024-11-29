import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  AUTH_PACKAGE_NAME,
  STAFF_GROUP_SERVICE_NAME,
  StaffGroupListResponse,
  StaffGroupServiceClient,
} from 'protos/dist/auth';
import { StaffAuthGuard } from '../../guard';
import { StaffPermissionDecorator } from '../../decorator';
import { StaffGroupListDto } from './dto';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'utils';

@Controller('staff-group')
export class StaffGroupController implements OnModuleInit {
  private staffGroupService: StaffGroupServiceClient;
  constructor(@Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.staffGroupService = this.client.getService<StaffGroupServiceClient>(
      STAFF_GROUP_SERVICE_NAME,
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'staff', action: 'edit' })
  @Get()
  getList(
    @Query() staffGroupListDto: StaffGroupListDto,
  ): Observable<StaffGroupListResponse> {
    return this.staffGroupService.getList({ ...staffGroupListDto }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }
}
