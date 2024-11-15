import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
  AUTH_HEALTH_SERVICE_NAME,
  AuthHealthCheckResponse,
} from 'protos/dist/auth';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getHello(): string {
    return this.authService.getHello();
  }

  @GrpcMethod(AUTH_HEALTH_SERVICE_NAME, 'check')
  check(): AuthHealthCheckResponse {
    return { status: true };
  }
}
