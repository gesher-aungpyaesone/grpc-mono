import { Injectable, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient, SystemUserType } from '@prisma/auth-ms';
import { StaffCreateRequest } from 'protos/dist/auth';
import * as grpc from '@grpc/grpc-js';
import { hashPassword } from 'utils';

@Injectable()
export class AuthPrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({ log: ['query', 'info', 'warn', 'error'] });
  }

  async onModuleInit() {
    await this.$connect();
  }

  private async validateEmailUniqueness(email: string): Promise<void> {
    const existingStaff = await this.staff.findUnique({ where: { email } });

    if (existingStaff) {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: JSON.stringify({ email: ['email must be unique'] }),
      });
    }
  }

  private async validatePositionExistence(position_id: number): Promise<void> {
    const position = await this.staffPosition.findUnique({
      where: { id: position_id },
    });

    if (!position) {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: JSON.stringify({
          position_id: ['position_id does not exist'],
        }),
      });
    }
  }

  async createStaff(staffCreateRequest: StaffCreateRequest) {
    const {
      first_name,
      last_name,
      email,
      password,
      department,
      position_id,
      profile_path,
      cover_photo_path,
      bio,
      created_by_id,
    } = staffCreateRequest;

    await this.validateEmailUniqueness(email);
    await this.validatePositionExistence(position_id);

    const hashedPassword = await hashPassword(password);

    const createdStaff = await this.staff.create({
      data: {
        user: {
          create: { type: SystemUserType.STAFF },
        },
        first_name,
        last_name,
        email,
        password: hashedPassword,
        department,
        profile_path,
        cover_photo_path,
        bio,
        position: { connect: { id: position_id } },
        created_by_id,
        update_by_id: created_by_id,
      },
    });

    delete createdStaff.password;
    delete createdStaff.deleted_at;

    return createdStaff;
  }
}
