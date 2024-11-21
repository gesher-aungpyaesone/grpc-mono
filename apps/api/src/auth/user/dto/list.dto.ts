import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UserListDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sort?: string | undefined;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  range?: string | undefined;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  filter?: string | undefined;
}
