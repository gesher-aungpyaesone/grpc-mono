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

export class StaffCreateDto {
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

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  department_id: number;

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
