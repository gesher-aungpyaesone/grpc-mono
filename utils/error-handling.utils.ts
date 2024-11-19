import * as grpc from '@grpc/grpc-js';
import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export function handleError(error: any) {
  switch (error.code) {
    case grpc.status.INVALID_ARGUMENT:
      return new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        errors: JSON.parse(error.details),
      });

    case grpc.status.NOT_FOUND:
      return new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        errors: { root: { serverError: error.details } },
      });

    case grpc.status.UNAUTHENTICATED:
      return new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        errors: { root: { serverError: error.details } },
      });

    case grpc.status.PERMISSION_DENIED:
      return new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        errors: { root: { serverError: error.details } },
      });

    case grpc.status.UNAVAILABLE:
    default:
      return new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errors: { root: { serverError: error.details } },
      });
  }
}
