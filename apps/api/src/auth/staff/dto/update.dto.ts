import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class StaffUpdateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  position_id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profile_path?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cover_photo_path?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;
}
