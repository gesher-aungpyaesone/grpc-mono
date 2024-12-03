import { Inject } from '@nestjs/common';
import { Prisma } from '@prisma/auth-ms';
import { StaffGroupListRequest } from 'protos/dist/auth';
import { AuthPrismaService } from './auth-prisma.service';
import { validateFilter, validateRange, validateSort } from 'utils';

export class StaffGroupService {
  constructor(
    @Inject()
    private prisma: AuthPrismaService,
  ) {}
  async getListStaffGroup(staffGroupListRequest: StaffGroupListRequest) {
    const { sort, range, filter } = staffGroupListRequest;
    const fields = Object.keys(Prisma.StaffGroupScalarFieldEnum);
    const parsedSort = validateSort(sort, fields);
    const parsedRange = validateRange(range);
    const parsedFilter = validateFilter(filter, fields);
    const queryOptions: Prisma.StaffGroupFindManyArgs = {
      include: {
        group: true,
        staff: true,
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
      const filterConditions: Record<string, any> = {};
      for (const key in parsedFilter) {
        const filterValue = parsedFilter[key];
        if (key === 'id' && Array.isArray(filterValue)) {
          filterConditions[key] = { in: filterValue };
        } else if (typeof filterValue === 'string') {
          filterConditions[key] = {
            contains: filterValue,
          };
        } else {
          filterConditions[key] = filterValue;
        }
      }

      queryOptions.where = {
        ...queryOptions.where,
        ...filterConditions,
      };
    }

    const staffGroups = await this.prisma.staffGroup.findMany(queryOptions);
    const totalCount = await this.prisma.staffGroup.count({
      where: queryOptions.where,
    });

    return { staffGroups, totalCount };
  }
}
