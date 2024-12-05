import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt } from 'class-validator';

export class StaffGroupAssignDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  staff_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  group_id: number;
}
