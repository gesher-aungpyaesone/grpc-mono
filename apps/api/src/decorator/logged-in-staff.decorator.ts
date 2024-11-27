import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const LoggedinStaff = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.staff;
  },
);
