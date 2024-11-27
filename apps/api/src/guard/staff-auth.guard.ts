import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { StaffAuthService } from '../auth/staff-auth/staff-auth.service';
import { Reflector } from '@nestjs/core';
import { STAFF_PERMISSION_DECORATOR } from '../decorator';

export class StaffAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject() private readonly authService: StaffAuthService,
  ) {}
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

    request.staff = verifiedStaff.data;

    if (verifiedStaff.data.is_root) {
      return true;
    }

    const allowedPermission = this.reflector.get<{
      resource: string;
      action: string;
    }>(STAFF_PERMISSION_DECORATOR, context.getHandler());
    if (allowedPermission) {
      const haveAccess = await this.authService.verifyAccess(
        verifiedStaff.data.id,
        allowedPermission,
      );
      if (!haveAccess) {
        throw new ForbiddenException();
      }
    }
    return true;
  }
}
