import { Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma } from '@prisma/auth-ms';
import * as grpc from '@grpc/grpc-js';
import { validateFilter, validateRange, validateSort } from 'utils';
import {
  StaffDepartmentCreateRequest,
  StaffDepartmentDeleteRequest,
  StaffDepartmentGetOneRequest,
  StaffDepartmentListRequest,
  StaffDepartmentUpdateRequest,
} from 'protos/dist/auth';
import { AuthPrismaService } from './auth-prisma.service';
export class StaffDepartmentService {
  constructor(
    @Inject()
    private prisma: AuthPrismaService,
  ) {}

  async validateStaffDepartmentExistence(department_id: number) {
    const department = await this.prisma.staffDepartment.findUnique({
      where: { id: department_id },
    });

    if (!department) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'department not found',
      });
    }

    return department;
  }

  async validateStaffDepartmentsExistence(department_ids: number[]) {
    const staffDepartments = await this.prisma.staffDepartment.findMany({
      where: {
        id: { in: department_ids },
      },
    });
    if (staffDepartments.length !== department_ids.length) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'One or more staff departments not found',
      });
    }

    return staffDepartments;
  }

  async createStaffDepartment(
    staffDepartmentCreateRequest: StaffDepartmentCreateRequest,
  ) {
    const { name, description, created_by_id } = staffDepartmentCreateRequest;
    const createdStaffDepartment = await this.prisma.staffDepartment.create({
      data: {
        name,
        description,
        created_by_id,
        updated_by_id: created_by_id,
      },
    });

    return createdStaffDepartment;
  }

  async getOneStaffDepartment(
    staffDepartmentGetOneRequest: StaffDepartmentGetOneRequest,
  ) {
    const { id } = staffDepartmentGetOneRequest;
    return await this.validateStaffDepartmentExistence(id);
  }

  async getFilterConditions(
    parsedFilter: Record<string, any>,
    current_user_id: number,
  ) {
    const filterConditions: Record<string, any> = {};

    if (parsedFilter['q']) {
      filterConditions['name'] = { contains: parsedFilter['q'] };
    }
    if (
      parsedFilter['is_allowed_all'] !== undefined &&
      !parsedFilter['is_allowed_all']
    ) {
      const ownedStaffs = await this.prisma.staffDepartment.findMany({
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

    if (parsedFilter['exclude']) {
      filterConditions['is_root'] = false;
    }

    return filterConditions;
  }

  async getListStaffDepartment(
    staffDepartmentListRequest: StaffDepartmentListRequest,
  ) {
    const { sort, range, filter, current_user_id } = staffDepartmentListRequest;
    const fields = Object.keys(Prisma.StaffDepartmentScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.StaffDepartmentFindManyArgs = {
      where: { deleted_at: null },
    };
    if (parsedSort) {
      const [field, order] = parsedSort;
      queryOptions.orderBy = { [field]: order };
    }

    if (parsedRange) {
      queryOptions.skip = parsedRange[0];
      queryOptions.take = parsedRange[1] + 1 - parsedRange[0];
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

    const staffDepartments =
      await this.prisma.staffDepartment.findMany(queryOptions);
    const totalCount = await this.prisma.staffDepartment.count({
      where: queryOptions.where,
    });
    return { staffDepartments, totalCount };
  }

  async updateStaffDepartment(
    staffDepartmentUpdateRequest: StaffDepartmentUpdateRequest,
  ) {
    const { id, name, description, updated_by_id } =
      staffDepartmentUpdateRequest;

    await this.validateStaffDepartmentExistence(id);

    const updatedStaffDepartment = await this.prisma.staffDepartment.update({
      where: { id },
      data: {
        name,
        description,
        updated_by_id,
      },
    });

    return updatedStaffDepartment;
  }

  async deleteStaffDepartment(
    staffDepartmentDeleteRequest: StaffDepartmentDeleteRequest,
  ) {
    const { id, deleted_by_id } = staffDepartmentDeleteRequest;
    await this.validateStaffDepartmentExistence(id);
    const deletedStaffDepartment = await this.prisma.staffDepartment.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id,
      },
    });
    return deletedStaffDepartment;
  }
}
