import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StaffCreateDto {
  @ApiProperty()
  first_name: string;

  @ApiProperty()
  last_name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  department: string;

  @ApiProperty()
  position_id: number;

  @ApiPropertyOptional()
  profile_path?: string;

  @ApiPropertyOptional()
  cover_photo_path?: string;

  @ApiPropertyOptional()
  bio?: string;
}
