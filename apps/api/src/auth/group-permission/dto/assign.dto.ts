import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsInt, ArrayNotEmpty } from 'class-validator';

export class GroupPermissionAssignDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  group_id: number;

  @ApiProperty({ type: [Number] })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  permission_ids: number[];
}
