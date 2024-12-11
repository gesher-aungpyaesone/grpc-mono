import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ClientCompanyCreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  strength?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  others?: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  industry_id: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  type_id: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  size_id: number;
}
