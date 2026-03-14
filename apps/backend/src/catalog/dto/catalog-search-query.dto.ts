import { Type } from "class-transformer";
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class CatalogSearchQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  query?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  region?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  group?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
