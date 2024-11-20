import { Body, Controller, Inject, OnModuleInit, Post } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  AUTH_PACKAGE_NAME,
  STAFF_AUTH_SERVICE_NAME,
  StaffAuthServiceClient,
  StaffLoginResponse,
} from 'protos/dist/auth';
import { StaffLoginDto } from './dto';
import { catchError, firstValueFrom } from 'rxjs';
import { handleError } from 'utils';
import { JwtService } from '@nestjs/jwt';
import * as grpc from '@grpc/grpc-js';

@Controller('staff-auth')
export class StaffAuthController implements OnModuleInit {
  private staffAuthService: StaffAuthServiceClient;
  constructor(
    @Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc,
    private jwtService: JwtService,
  ) {}

  onModuleInit() {
    this.staffAuthService = this.client.getService<StaffAuthServiceClient>(
      STAFF_AUTH_SERVICE_NAME,
    );
  }

  @Post('login')
  async login(
    @Body() staffLoginDto: StaffLoginDto,
  ): Promise<StaffLoginResponse> {
    const { remember_me } = staffLoginDto;
    const { data } = await firstValueFrom(
      this.staffAuthService.validate(staffLoginDto).pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      ),
    );

    if (!data) {
      throw handleError({
        code: grpc.status.UNAUTHENTICATED,
        details: 'Invalid Credentials',
      });
    }

    return {
      access_token: this.jwtService.sign({
        sub: data.id,
        email: data.email,
        expiresIn: remember_me ? '3d' : '4h',
      }),
    };
  }
}
