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
import { StaffDepartmentService } from './staff-department-prisma.service';

export class StaffService {
  constructor(
    @Inject()
    private prisma: AuthPrismaService,
    @Inject()
    private readonly staffPositionService: StaffPositionService,
    @Inject()
    private readonly staffDepartmentService: StaffDepartmentService,
  ) {}

  async validateStaffEmailUniqueness(email: string): Promise<void> {
    const existingStaff = await this.prisma.staff.findUnique({
      where: { email },
      include: {
        position: true,
        department: true,
      },
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
      include: {
        position: true,
        department: true,
      },
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
      include: {
        position: true,
        department: true,
      },
    });

    if (!existingStaff || (existingStaff && existingStaff.deleted_at))
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'staff not found',
      });

    return existingStaff;
  }
  async validateStaffsExistence(staff_ids: number[]): Promise<Staff[]> {
    const staffs = await this.prisma.staff.findMany({
      where: {
        id: { in: staff_ids },
      },
      include: {
        position: true,
        department: true,
      },
    });
    if (staffs.length !== staff_ids.length) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'One or more staffs not found',
      });
    }

    return staffs;
  }

  async createStaff(staffCreateRequest: StaffCreateRequest) {
    const { email, password, position_id, department_id } = staffCreateRequest;

    await this.validateStaffEmailUniqueness(email);
    await this.staffPositionService.validateStaffPositionExistence(position_id);
    await this.staffDepartmentService.validateStaffDepartmentExistence(
      department_id,
    );

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
        department: { connect: { id: staffCreateRequest.department_id } },
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

  async getFilterConditions(
    parsedFilter: Record<string, any>,
    current_user_id: number,
  ) {
    const filterConditions: Record<string, any> = {};

    if (parsedFilter['q']) {
      filterConditions['email'] = { contains: parsedFilter['q'] };
    }
    if (
      parsedFilter['is_allowed_all'] !== undefined &&
      !parsedFilter['is_allowed_all']
    ) {
      const ownedStaffs = await this.prisma.staff.findMany({
        where: {
          created_by_id: current_user_id,
        },
        select: {
          id: true,
        },
      });
      const ownedIds = ownedStaffs.map(({ id }) => id);
      if (parsedFilter['id']) {
        const allowIds = parsedFilter['id'];
        filterConditions['id'] = { in: ownedIds.concat(allowIds) };
      } else {
        filterConditions['id'] = { in: ownedIds };
      }
    }

    if (parsedFilter['department_id']) {
      filterConditions['department_id'] = parsedFilter['department_id'];
    }

    if (parsedFilter['position_id']) {
      filterConditions['position_id'] = parsedFilter['position_id'];
    }

    if (parsedFilter['exclude']) {
      filterConditions['is_root'] = false;
    }
    return filterConditions;
  }

  async getListStaff(staffListRequest: StaffListRequest) {
    const { sort, range, filter, current_user_id } = staffListRequest;
    const fields = Object.keys(Prisma.StaffScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.StaffFindManyArgs = {
      where: { deleted_at: null },
      include: {
        position: true,
        department: true,
      },
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
      const filterConditions = await this.getFilterConditions(
        parsedFilter,
        current_user_id,
      );
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
    const { id, email, password, position_id, department_id } =
      staffUpdateRequest;

    const existingStaff = await this.validateStaffExistence(id);

    if (existingStaff.email !== email)
      await this.validateStaffEmailUniqueness(email);
    await this.staffPositionService.validateStaffPositionExistence(position_id);
    await this.staffDepartmentService.validateStaffDepartmentExistence(
      department_id,
    );

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
        department: { connect: { id: staffUpdateRequest.department_id } },
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
