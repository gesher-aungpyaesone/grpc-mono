import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Query,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  AUTH_PACKAGE_NAME,
  PERMISSION_SERVICE_NAME,
  PermissionListResponse,
  PermissionResponse,
  PermissionServiceClient,
} from 'protos/dist/auth';
import { catchError, Observable } from 'rxjs';
import { PermissionListDto } from './dto';
import { handleError } from 'utils';

@Controller('permission')
export class PermissionController implements OnModuleInit {
  private permissionService: PermissionServiceClient;
  constructor(@Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.permissionService = this.client.getService<PermissionServiceClient>(
      PERMISSION_SERVICE_NAME,
    );
  }

  @Get(':id')
  getOne(@Param('id') id: number): Observable<PermissionResponse> {
    return this.permissionService.getOne({ id: +id }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @Get()
  getList(
    @Query() staffPositionListDto: PermissionListDto,
  ): Observable<PermissionListResponse> {
    return this.permissionService.getList({ ...staffPositionListDto }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }
}