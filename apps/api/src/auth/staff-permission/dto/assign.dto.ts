import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsInt, ArrayNotEmpty } from 'class-validator';

export class StaffPermissionAssignDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  staff_id: number;

  @ApiProperty({ type: [Number] })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  permission_ids: number[];
}
