import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { StaffAuthService } from '../auth/staff-auth/staff-auth.service';

export class AuthGuard implements CanActivate {
  constructor(@Inject() private readonly authService: StaffAuthService) {}
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    const verifiedStaff = await this.authService.verifyToken(token);
    if (!verifiedStaff || (verifiedStaff && !verifiedStaff.data)) {
      throw new UnauthorizedException();
    }

    const haveAccess = await this.authService.verifyAccess(
      verifiedStaff.data.id,
    );
    if (!haveAccess) {
      throw new ForbiddenException();
    }
    return true;
  }
}
