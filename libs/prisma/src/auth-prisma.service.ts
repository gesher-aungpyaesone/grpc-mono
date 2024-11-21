import { Injectable, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  Permission,
  Prisma,
  PrismaClient,
  Staff,
  StaffPosition,
  SystemUserType,
  User,
} from '@prisma/auth-ms';
import {
  PermissionGetOneRequest,
  PermissionListRequest,
  StaffCreateRequest,
  StaffDeleteRequest,
  StaffGetOneRequest,
  StaffListRequest,
  StaffPermissionAssignRequest,
  StaffPermissionListByStaffRequest,
  StaffPositionCreateRequest,
  StaffPositionDeleteRequest,
  StaffPositionGetOneRequest,
  StaffPositionListRequest,
  StaffPositionUpdateRequest,
  StaffUpdateRequest,
  UserGetOneRequest,
  UserListRequest,
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
        message: JSON.stringify({ email: 'email must be unique' }),
      });
    }
  }

  private async validatePermissionExistence(
    permission_id: number,
  ): Promise<Permission> {
    const permission = await this.permission.findUnique({
      where: { id: permission_id },
      include: { type: true, resource: true },
    });

    if (!permission) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'permission not found',
      });
    }

    return permission;
  }

  private async validatePermissionsExistence(
    permission_ids: number[],
  ): Promise<Permission[]> {
    const permissions = await this.permission.findMany({
      where: {
        id: { in: permission_ids },
      },
      include: { type: true, resource: true },
    });
    if (permissions.length !== permission_ids.length) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'One or more permissions not found',
      });
    }

    return permissions;
  }

  private async validateStaffPositionExistence(
    position_id: number,
  ): Promise<StaffPosition> {
    const position = await this.staffPosition.findUnique({
      where: { id: position_id },
    });

    if (!position) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'position not found',
      });
    }

    return position;
  }

  private async validateStaffExistenceByEmail(email: string): Promise<Staff> {
    const existingStaff = await this.staff.findUnique({
      where: { email },
    });

    if (!existingStaff || (existingStaff && existingStaff.deleted_at))
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'staff not found',
      });

    return existingStaff;
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

  private async validateUserExistence(user_id: number): Promise<User> {
    const existingUser = await this.user.findUnique({
      where: { id: user_id },
      include: { staff: true },
    });

    if (!existingUser)
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'user not found',
      });

    return existingUser;
  }

  async getOnePermission(permissionGetOneRequest: PermissionGetOneRequest) {
    const { id } = permissionGetOneRequest;
    return await this.validatePermissionExistence(id);
  }

  async getListPermission(permissionListRequest: PermissionListRequest) {
    const { sort, range, filter } = permissionListRequest;
    const fields = Object.keys(Prisma.PermissionScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.PermissionFindManyArgs = {
      include: { type: true, resource: true },
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

    const permissions = await this.permission.findMany(queryOptions);
    const totalCount = await this.permission.count({
      where: queryOptions.where,
      skip: queryOptions.skip,
      take: queryOptions.take,
    });
    return { permissions, totalCount };
  }

  async getOneUser(userGetOneRequest: UserGetOneRequest) {
    const { id } = userGetOneRequest;
    return await this.validateUserExistence(id);
  }

  async getListUser(userListRequest: UserListRequest) {
    const { sort, range, filter } = userListRequest;
    const fields = Object.keys(Prisma.UserScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.UserFindManyArgs = {
      include: { staff: true },
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

    const users = await this.user.findMany(queryOptions);
    const totalCount = await this.user.count({
      where: queryOptions.where,
      skip: queryOptions.skip,
      take: queryOptions.take,
    });
    return { users, totalCount };
  }

  async createStaff(staffCreateRequest: StaffCreateRequest) {
    const { email, password, position_id } = staffCreateRequest;

    await this.validateEmailUniqueness(email);
    await this.validateStaffPositionExistence(position_id);

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
    await this.validateStaffPositionExistence(position_id);

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
    const deletedStaff = await this.staff.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id,
      },
    });

    delete deletedStaff.password;
    return deletedStaff;
  }

  async createStaffPosition(
    staffPositionCreateRequest: StaffPositionCreateRequest,
  ) {
    const { name, description, created_by_id } = staffPositionCreateRequest;
    const createdStaffPosition = await this.staffPosition.create({
      data: {
        name,
        description,
        created_by_id,
        updated_by_id: created_by_id,
      },
    });

    return createdStaffPosition;
  }

  async getOneStaffPosition(
    staffPositionGetOneRequest: StaffPositionGetOneRequest,
  ) {
    const { id } = staffPositionGetOneRequest;
    return await this.validateStaffPositionExistence(id);
  }

  async getListStaffPosition(
    staffPositionListRequest: StaffPositionListRequest,
  ) {
    const { sort, range, filter } = staffPositionListRequest;
    const fields = Object.keys(Prisma.StaffPositionScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.StaffPositionFindManyArgs = {
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

    const staffPositions = await this.staffPosition.findMany(queryOptions);
    const totalCount = await this.staffPosition.count({
      where: queryOptions.where,
      skip: queryOptions.skip,
      take: queryOptions.take,
    });
    return { staffPositions, totalCount };
  }

  async updateStaffPosition(
    staffPositionUpdateRequest: StaffPositionUpdateRequest,
  ) {
    const { id, name, description, updated_by_id } = staffPositionUpdateRequest;

    await this.validateStaffPositionExistence(id);

    const updatedStaffPosition = await this.staffPosition.update({
      where: { id },
      data: {
        name,
        description,
        updated_by_id,
      },
    });

    return updatedStaffPosition;
  }

  async deleteStaffPosition(
    staffPositionDeleteRequest: StaffPositionDeleteRequest,
  ) {
    const { id, deleted_by_id } = staffPositionDeleteRequest;
    await this.validateStaffPositionExistence(id);
    const deletedStaffPosition = await this.staffPosition.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id,
      },
    });
    return deletedStaffPosition;
  }

  async getListStaffPermissionByStaff(
    staffPermissionListByStaffRequest: StaffPermissionListByStaffRequest,
  ) {
    const { staff_id } = staffPermissionListByStaffRequest;
    const staff = await this.staff.findUnique({
      where: { id: staff_id },
      select: {
        deleted_at: true,
        staff_permissions: {
          include: {
            permission: {
              include: { resource: true, type: true },
            },
          },
        },
      },
    });

    if (!staff || (staff && staff.deleted_at))
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'staff not found',
      });

    return staff.staff_permissions;
  }

  async assignStaffPermission(
    staffPermissionAssignRequest: StaffPermissionAssignRequest,
  ) {
    const { staff_id, permission_ids, created_by_id } =
      staffPermissionAssignRequest;
    await this.validateStaffExistence(staff_id);
    await this.validatePermissionsExistence(permission_ids);

    const existingAssignments = await this.staffPermission.findMany({
      where: {
        staff_id,
        permission_id: { in: permission_ids },
      },
      select: { permission_id: true },
    });

    const alreadyAssignedPermissionIds = existingAssignments.map(
      (assignment) => assignment.permission_id,
    );

    const permissionsToAssign = permission_ids.filter(
      (permission_id) => !alreadyAssignedPermissionIds.includes(permission_id),
    );

    if (permissionsToAssign.length) {
      const staffPermissions = permissionsToAssign.map((permission_id) => ({
        staff_id,
        permission_id,
        created_by_id,
      }));

      await this.staffPermission.createMany({
        data: staffPermissions,
      });
    }

    return await this.getListStaffPermissionByStaff({ staff_id });
  }
}
