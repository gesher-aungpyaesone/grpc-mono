import { join } from 'path';
import { AUTH_PACKAGE_NAME } from 'protos/dist/auth';

export const AUTH_GRPC_OPTION = {
  package: AUTH_PACKAGE_NAME,
  protoPath: join(__dirname, '../../../protos/auth.proto'),
  loader: {
    keepCase: true,
    includeDirs: [__dirname, '../../../protos'],
  },
};
