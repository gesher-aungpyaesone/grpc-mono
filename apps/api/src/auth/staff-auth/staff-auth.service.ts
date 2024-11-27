import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AUTH_PACKAGE_NAME,
  STAFF_PERMISSION_SERVICE_NAME,
  STAFF_SERVICE_NAME,
  StaffPermissionServiceClient,
  StaffServiceClient,
} from 'protos/dist/auth';
import { ClientGrpc } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { handleError } from 'utils';

@Injectable()
export class StaffAuthService implements OnModuleInit {
  private staffService: StaffServiceClient;
  private staffPermissionService: StaffPermissionServiceClient;
  constructor(
    private jwtService: JwtService,
    @Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.staffService =
      this.client.getService<StaffServiceClient>(STAFF_SERVICE_NAME);
    this.staffPermissionService =
      this.client.getService<StaffPermissionServiceClient>(
        STAFF_PERMISSION_SERVICE_NAME,
      );
  }

  async verifyToken(token: string) {
    try {
      const decodedToken = this.jwtService.verify(token);
      const staff = await firstValueFrom(
        this.staffService.getOne({ id: decodedToken.sub }).pipe(
          catchError((error) => {
            throw handleError(error);
          }),
        ),
      );
      return staff;
    } catch (error) {
      return null;
    }
  }

  async verifyAccess(
    staff_id: number,
    permission: {
      resource: string;
      action: string;
    },
  ) {
    const { total_count, data } = await firstValueFrom(
      this.staffPermissionService.getListByStaff({ staff_id }).pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      ),
    );

    if (!total_count) {
      return false;
    }

    const allow = data.some(
      (perm) =>
        perm.permission.resource.name == permission.resource &&
        perm.permission.type.name == permission.action,
    );
    return !!allow;
  }
}
