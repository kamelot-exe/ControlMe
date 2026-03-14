import { Transform, type TransformFnParams, Type } from "class-transformer";
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { SUPPORTED_BILLING_PERIODS } from "../../common/constants/domain.constants";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import type { BillingPeriod } from "@/shared/types";

const SUBSCRIPTION_SORT_FIELDS = [
  "createdAt",
  "name",
  "nextChargeDate",
  "price",
  "updatedAt",
] as const;

const toOptionalBoolean = ({ value }: TransformFnParams) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  return value;
};

export class ListSubscriptionsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsIn(SUPPORTED_BILLING_PERIODS)
  billingPeriod?: BillingPeriod;

  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(365)
  upcomingWithinDays?: number;

  @IsOptional()
  @IsIn(SUBSCRIPTION_SORT_FIELDS)
  sortBy?: (typeof SUBSCRIPTION_SORT_FIELDS)[number];

  @IsOptional()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc";
}
