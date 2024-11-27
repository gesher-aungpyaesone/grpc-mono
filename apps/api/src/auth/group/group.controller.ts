import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  AUTH_PACKAGE_NAME,
  GROUP_SERVICE_NAME,
  GroupListResponse,
  GroupResponse,
  GroupServiceClient,
  Staff,
} from 'protos/dist/auth';
import { StaffAuthGuard } from '../../guard';
import { LoggedinStaff, StaffPermissionDecorator } from '../../decorator';
import { GroupCreateDto, GroupListDto, GroupUpdateDto } from './dto';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'utils';

@Controller('group')
export class GroupController implements OnModuleInit {
  private groupService: GroupServiceClient;
  constructor(@Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.groupService =
      this.client.getService<GroupServiceClient>(GROUP_SERVICE_NAME);
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'group', action: 'create' })
  @Post()
  create(
    @Body() staffCreateDto: GroupCreateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<GroupResponse> {
    return this.groupService
      .create({ ...staffCreateDto, created_by_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @Get(':id')
  getOne(@Param('id') id: number): Observable<GroupResponse> {
    return this.groupService.getOne({ id: +id }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @Get()
  getList(@Query() groupListDto: GroupListDto): Observable<GroupListResponse> {
    return this.groupService.getList({ ...groupListDto }).pipe(
      catchError((error) => {
        throw handleError(error);
      }),
    );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'group', action: 'edit' })
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateStaffDto: GroupUpdateDto,
    @LoggedinStaff() staff: Staff,
  ): Observable<GroupResponse> {
    return this.groupService
      .update({ ...updateStaffDto, updated_by_id: staff.user_id, id: +id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }

  @ApiBearerAuth()
  @UseGuards(StaffAuthGuard)
  @StaffPermissionDecorator({ resource: 'group', action: 'delete' })
  @Delete(':id')
  delete(
    @Param('id') id: number,
    @LoggedinStaff() staff: Staff,
  ): Observable<GroupResponse> {
    return this.groupService
      .delete({ id: +id, deleted_by_id: staff.user_id })
      .pipe(
        catchError((error) => {
          throw handleError(error);
        }),
      );
  }
}
