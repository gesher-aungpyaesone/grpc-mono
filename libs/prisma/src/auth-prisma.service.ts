import { Injectable, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma, PrismaClient, Staff, SystemUserType } from '@prisma/auth-ms';
import {
  StaffCreateRequest,
  StaffDeleteRequest,
  StaffGetOneRequest,
  StaffListRequest,
  StaffUpdateRequest,
} from 'protos/dist/auth';
import * as grpc from '@grpc/grpc-js';
import {
  hashPassword,
  validateFilter,
  validateRange,
  validateSort,
} from 'utils';

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

  private async validateStaffExistence(staff_id: number): Promise<Staff> {
    const existingStaff = await this.staff.findUnique({
      where: { id: staff_id },
    });

    if (!existingStaff || (existingStaff && existingStaff.deleted_at))
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'staff not found',
      });

    return existingStaff;
  }

  async createStaff(staffCreateRequest: StaffCreateRequest) {
    const { email, password, position_id } = staffCreateRequest;

    await this.validateEmailUniqueness(email);
    await this.validatePositionExistence(position_id);

    const hashedPassword = await hashPassword(password);

    const createdStaff = await this.staff.create({
      data: {
        user: {
          create: { type: SystemUserType.STAFF },
        },
        first_name: staffCreateRequest.first_name,
        last_name: staffCreateRequest.last_name,
        email: staffCreateRequest.email,
        password: hashedPassword,
        department: staffCreateRequest.department,
        profile_path: staffCreateRequest.profile_path,
        cover_photo_path: staffCreateRequest.cover_photo_path,
        bio: staffCreateRequest.bio,
        position: { connect: { id: staffCreateRequest.position_id } },
        created_by_id: staffCreateRequest.created_by_id,
        update_by_id: staffCreateRequest.created_by_id,
      },
    });

    delete createdStaff.password;
    delete createdStaff.deleted_at;

    return createdStaff;
  }

  async getOneStaff(staffGetOneRequest: StaffGetOneRequest) {
    const { id } = staffGetOneRequest;
    return await this.validateStaffExistence(id);
  }

  async getListStaff(staffListRequest: StaffListRequest) {
    const { sort, range, filter } = staffListRequest;
    const fields = Object.keys(Prisma.StaffScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.StaffFindManyArgs = {
      where: { deleted_at: null },
    };
    if (parsedSort) {
      const [field, order] = parsedSort;
      queryOptions.orderBy = { [field]: order };
    }

    if (parsedRange) {
      queryOptions.skip = parsedRange[0];
      queryOptions.take = parsedRange[1] - parsedRange[0];
    }
    if (parsedFilter) {
      queryOptions.where = {
        ...queryOptions.where,
        ...parsedFilter,
      };
    }

    const staffs = await this.staff.findMany(queryOptions);
    const totalCount = await this.staff.count({
      where: queryOptions.where,
      skip: queryOptions.skip,
      take: queryOptions.take,
    });
    return { staffs, totalCount };
  }

  async updateStaff(staffUpdateRequest: StaffUpdateRequest) {
    const { id, email, password, position_id } = staffUpdateRequest;

    const existingStaff = await this.validateStaffExistence(id);

    if (existingStaff.email !== email)
      await this.validateEmailUniqueness(email);
    await this.validatePositionExistence(position_id);

    const hashedPassword = password
      ? await hashPassword(password)
      : existingStaff.password;

    const updatedStaff = await this.staff.update({
      where: { id },
      data: {
        first_name: staffUpdateRequest.first_name,
        last_name: staffUpdateRequest.last_name,
        email: staffUpdateRequest.email,
        password: hashedPassword,
        department: staffUpdateRequest.department,
        profile_path: staffUpdateRequest.profile_path,
        cover_photo_path: staffUpdateRequest.cover_photo_path,
        bio: staffUpdateRequest.bio,
        position: { connect: { id: staffUpdateRequest.position_id } },
        update_by_id: staffUpdateRequest.updated_by_id,
      },
    });

    delete updatedStaff.password;
    delete updatedStaff.deleted_at;

    return updatedStaff;
  }

  async deleteStaff(staffDeleteRequest: StaffDeleteRequest) {
    const { id } = staffDeleteRequest;
    await this.validateStaffExistence(id);
    const deletedStaff = await this.staff.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });

    delete deletedStaff.password;
    return deletedStaff;
  }
}
