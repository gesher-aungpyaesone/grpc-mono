import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TargetListDto {
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
