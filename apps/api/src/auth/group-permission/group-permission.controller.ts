import { Body, Controller, Get, Inject, OnModuleInit, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AUTH_PACKAGE_NAME, GroupPermissionListResponse, GroupPermissionServiceClient, Staff, GROUP_PERMISSION_SERVICE_NAME } from 'protos/dist/auth';
import { StaffAuthGuard } from '../../guard';
import { LoggedinStaff, StaffPermissionDecorator } from '../../decorator';
import { GroupPermissionAssignDto, GroupPermissionListDto } from './dto';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'utils';

@Controller('group-permission')
export class GroupPermissionController implements OnModuleInit {
    private groupPermissionService: GroupPermissionServiceClient;
    constructor(@Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc) {}
  
    onModuleInit() {
      this.groupPermissionService =
        this.client.getService<GroupPermissionServiceClient>(
          GROUP_PERMISSION_SERVICE_NAME,
        );
    }
  
    @ApiBearerAuth()
    @UseGuards(StaffAuthGuard)
    @StaffPermissionDecorator({ resource: 'group', action: 'edit' })
    @Post()
    create(
      @Body() groupPermissionAssignDto: GroupPermissionAssignDto,
      @LoggedinStaff() staff: Staff,
    ): Observable<GroupPermissionListResponse> {
      return this.groupPermissionService
        .assign({ ...groupPermissionAssignDto, created_by_id: staff.user_id })
        .pipe(
          catchError((error) => {
            throw handleError(error);
          }),
        );
    }
  
    @Get('by/:group_id')
    getListByGroup(
      @Param('group_id') group_id: number,
    ): Observable<GroupPermissionListResponse> {
      return this.groupPermissionService
        .getListByGroup({ group_id: +group_id })
        .pipe(
          catchError((error) => {
            throw handleError(error);
          }),
        );
    }
  
    @ApiBearerAuth()
    @UseGuards(StaffAuthGuard)
    @StaffPermissionDecorator({ resource: 'group', action: 'edit' })
    @Get()
    getList(
      @Query() groupPermissionListDto: GroupPermissionListDto,
    ): Observable<GroupPermissionListResponse> {
      return this.groupPermissionService
        .getList({ ...groupPermissionListDto })
        .pipe(
          catchError((error) => {
            throw handleError(error);
          }),
        );
    }
  }
  
