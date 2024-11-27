import { SetMetadata } from '@nestjs/common';

export const STAFF_PERMISSION_DECORATOR = 'staff-permission-decorator';
export const StaffPermissionDecorator = (body: {
  resource: string;
  action: string;
}) => SetMetadata(STAFF_PERMISSION_DECORATOR, body);
