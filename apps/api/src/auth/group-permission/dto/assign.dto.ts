import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsInt, IsBoolean } from 'class-validator';

export class GroupPermissionAssignDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  group_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  permission_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  is_allowed_all: boolean;

  @ApiProperty({ type: [Number] })
  @IsNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  allow_ids: number[];
}
