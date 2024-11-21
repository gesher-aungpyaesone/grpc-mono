import { SystemUserType as GrpcSystemUserType } from 'protos/dist/auth';
import { SystemUserType as PrismaSystemUserType } from '@prisma/auth-ms';

export function convertSystemUserTypeGrpcToPrisma(
  prismaEnum: PrismaSystemUserType,
): GrpcSystemUserType {
  switch (prismaEnum) {
    case PrismaSystemUserType.CUSTOMER:
      return GrpcSystemUserType.CUSTOMER;
    case PrismaSystemUserType.STAFF:
        return GrpcSystemUserType.STAFF
    default:
        return GrpcSystemUserType.CUSTOMER
  }
}
