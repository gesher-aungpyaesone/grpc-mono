import { Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma, StaffPosition } from '@prisma/auth-ms';
import * as grpc from '@grpc/grpc-js';
import { validateFilter, validateRange, validateSort } from 'utils';
import {
  StaffPositionCreateRequest,
  StaffPositionDeleteRequest,
  StaffPositionGetOneRequest,
  StaffPositionListRequest,
  StaffPositionUpdateRequest,
} from 'protos/dist/auth';
import { AuthPrismaService } from './auth-prisma.service';
export class StaffPositionService {
  constructor(
    @Inject()
    private prisma: AuthPrismaService,
  ) {}

  async validateStaffPositionExistence(
    position_id: number,
  ): Promise<StaffPosition> {
    const position = await this.prisma.staffPosition.findUnique({
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

  async createStaffPosition(
    staffPositionCreateRequest: StaffPositionCreateRequest,
  ) {
    const { name, description, created_by_id } = staffPositionCreateRequest;
    const createdStaffPosition = await this.prisma.staffPosition.create({
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

    const staffPositions =
      await this.prisma.staffPosition.findMany(queryOptions);
    const totalCount = await this.prisma.staffPosition.count({
      where: queryOptions.where,
    });
    return { staffPositions, totalCount };
  }

  async updateStaffPosition(
    staffPositionUpdateRequest: StaffPositionUpdateRequest,
  ) {
    const { id, name, description, updated_by_id } = staffPositionUpdateRequest;

    await this.validateStaffPositionExistence(id);

    const updatedStaffPosition = await this.prisma.staffPosition.update({
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
    const deletedStaffPosition = await this.prisma.staffPosition.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id,
      },
    });
    return deletedStaffPosition;
  }
}