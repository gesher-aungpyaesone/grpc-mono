import { GroupService } from '@app/prisma/auth';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GROUP_SERVICE_NAME,
  GroupCreateRequest,
  GroupDeleteRequest,
  GroupGetOneRequest,
  GroupListRequest,
  GroupListResponse,
  GroupResponse,
  GroupUpdateRequest,
} from 'protos/dist/auth';
import { transformTimestamps } from 'utils';

@Controller('group')
export class GroupController {
  constructor(private readonly prisma: GroupService) {}
  @GrpcMethod(GROUP_SERVICE_NAME, 'create')
  async create(groupCreateRequest: GroupCreateRequest): Promise<GroupResponse> {
    const createdGroup = await this.prisma.createGroup(groupCreateRequest);
    const timestamps = transformTimestamps(
      createdGroup.created_at,
      createdGroup.updated_at,
      createdGroup.deleted_at,
    );

    return {
      data: {
        ...createdGroup,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(GROUP_SERVICE_NAME, 'getOne')
  async getOne(groupGetOneRequest: GroupGetOneRequest): Promise<GroupResponse> {
    const group = await this.prisma.getOneGroup(groupGetOneRequest);
    const timestamps = transformTimestamps(
      group.created_at,
      group.updated_at,
      group.deleted_at,
    );

    return {
      data: {
        ...group,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(GROUP_SERVICE_NAME, 'getList')
  async getList(
    groupListRequest: GroupListRequest,
  ): Promise<GroupListResponse> {
    const { groups, totalCount } =
      await this.prisma.getListGroup(groupListRequest);
    const transformedGroups = groups.map((group) => {
      const timestamps = transformTimestamps(
        group.created_at,
        group.updated_at,
        group.deleted_at,
      );
      return { ...group, ...timestamps };
    });
    return {
      data: transformedGroups,
      total_count: totalCount,
    };
  }

  @GrpcMethod(GROUP_SERVICE_NAME, 'update')
  async update(groupUpdateRequest: GroupUpdateRequest): Promise<GroupResponse> {
    const updatedGroup = await this.prisma.updateGroup(groupUpdateRequest);
    const timestamps = transformTimestamps(
      updatedGroup.created_at,
      updatedGroup.updated_at,
      updatedGroup.deleted_at,
    );

    return {
      data: {
        ...updatedGroup,
        ...timestamps,
      },
    };
  }

  @GrpcMethod(GROUP_SERVICE_NAME, 'delete')
  async delete(groupDeleteRequest: GroupDeleteRequest): Promise<GroupResponse> {
    const deletedGroup = await this.prisma.deleteGroup(groupDeleteRequest);
    const timestamps = transformTimestamps(
      deletedGroup.created_at,
      deletedGroup.updated_at,
      deletedGroup.deleted_at,
    );

    return {
      data: {
        ...deletedGroup,
        ...timestamps,
      },
    };
  }
}
