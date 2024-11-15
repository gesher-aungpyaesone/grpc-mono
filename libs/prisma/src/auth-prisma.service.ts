import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, SystemUserType } from '@prisma/auth-ms';
import { StaffCreateRequest } from 'protos/dist/auth';

@Injectable()
export class AuthPrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({ log: ['query', 'info', 'warn', 'error'] });
  }
  async onModuleInit() {
    await this.$connect();
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

    const createdStaff = await this.staff.create({
      data: {
        user: {
          create: {
            type: SystemUserType.STAFF,
          },
        },
        first_name,
        last_name,
        email,
        password,
        department,
        profile_path,
        cover_photo_path,
        bio,
        position: { connect: { id: position_id } },
        created_by_id,
        update_by_id: created_by_id,
      },
    });

    return createdStaff;
  }
}
