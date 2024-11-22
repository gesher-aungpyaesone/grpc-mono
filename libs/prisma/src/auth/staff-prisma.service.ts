import { Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Staff, Prisma, SystemUserType } from '@prisma/auth-ms';
import * as grpc from '@grpc/grpc-js';
import {
  hashPassword,
  validateFilter,
  validateRange,
  validateSort,
} from 'utils';
import {
  StaffCreateRequest,
  StaffDeleteRequest,
  StaffGetOneRequest,
  StaffListRequest,
  StaffUpdateRequest,
} from 'protos/dist/auth';
import { StaffPositionService } from './staff-position-prisma.service';
import { AuthPrismaService } from './auth-prisma.service';

export class StaffService {
  constructor(
    @Inject()
    private prisma: AuthPrismaService,
    @Inject()
    private readonly staffPositionService: StaffPositionService,
  ) {}

  async validateStaffEmailUniqueness(email: string): Promise<void> {
    const existingStaff = await this.prisma.staff.findUnique({
      where: { email },
    });

    if (existingStaff) {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: JSON.stringify({ email: 'email must be unique' }),
      });
    }
  }

  async validateStaffExistenceByEmail(email: string): Promise<Staff> {
    const existingStaff = await this.prisma.staff.findUnique({
      where: { email },
    });

    if (!existingStaff || (existingStaff && existingStaff.deleted_at))
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'staff not found',
      });

    return existingStaff;
  }

  async validateStaffExistence(staff_id: number): Promise<Staff> {
    const existingStaff = await this.prisma.staff.findUnique({
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

    await this.validateStaffEmailUniqueness(email);
    await this.staffPositionService.validateStaffPositionExistence(position_id);

    const hashedPassword = await hashPassword(password);

    const createdStaff = await this.prisma.staff.create({
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
        updated_by_id: staffCreateRequest.created_by_id,
      },
    });

    delete createdStaff.password;
    delete createdStaff.deleted_at;

    return createdStaff;
  }

  async getOneStaffByEmail(email: string) {
    return await this.validateStaffExistenceByEmail(email);
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
    if (parsedFilter && Object.keys(parsedFilter).length > 0) {
      const filterConditions: Record<string, any> = {};
      for (const key in parsedFilter) {
        if (key in parsedFilter) {
          const filterValue = parsedFilter[key];
          if (key === 'id' && Array.isArray(filterValue)) {
            filterConditions[key] = { in: filterValue };
          } else if (typeof filterValue === 'string') {
            filterConditions[key] = {
              contains: filterValue,
              mode: 'insensitive',
            };
          } else {
            filterConditions[key] = filterValue;
          }
        }
      }

      queryOptions.where = {
        ...queryOptions.where,
        ...filterConditions,
      };
    }

    const staffs = await this.prisma.staff.findMany(queryOptions);
    const totalCount = await this.prisma.staff.count({
      where: queryOptions.where,
    });
    return { staffs, totalCount };
  }

  async updateStaff(staffUpdateRequest: StaffUpdateRequest) {
    const { id, email, password, position_id } = staffUpdateRequest;

    const existingStaff = await this.validateStaffExistence(id);

    if (existingStaff.email !== email)
      await this.validateStaffEmailUniqueness(email);
    await this.staffPositionService.validateStaffPositionExistence(position_id);

    const hashedPassword = password
      ? await hashPassword(password)
      : existingStaff.password;

    const updatedStaff = await this.prisma.staff.update({
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
        updated_by_id: staffUpdateRequest.updated_by_id,
      },
    });

    delete updatedStaff.password;
    delete updatedStaff.deleted_at;

    return updatedStaff;
  }

  async deleteStaff(staffDeleteRequest: StaffDeleteRequest) {
    const { id, deleted_by_id } = staffDeleteRequest;
    await this.validateStaffExistence(id);
    const deletedStaff = await this.prisma.staff.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id,
      },
    });

    delete deletedStaff.password;
    return deletedStaff;
  }
}
