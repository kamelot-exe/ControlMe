import {
  type TransformFnParams,
  Transform,
  Type,
} from "class-transformer";
import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
  MinLength,
  MaxLength,
  IsIn,
  IsUrl,
  Max,
  IsInt,
} from "class-validator";
import { SUPPORTED_BILLING_PERIODS } from "../../common/constants/domain.constants";
import { BillingPeriod } from "@/shared/types";

const trimValue = ({ value }: TransformFnParams) =>
  typeof value === "string" ? value.trim() : value;

const emptyStringToUndefined = ({ value }: TransformFnParams) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export class CreateSubscriptionDto {
  @Transform(trimValue)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01, { message: "Price must be greater than 0" })
  price!: number;

  @IsIn(SUPPORTED_BILLING_PERIODS)
  billingPeriod!: BillingPeriod;

  @IsDateString()
  nextChargeDate!: string;

  @Transform(trimValue)
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  category!: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  @MaxLength(80)
  serviceGroup?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  needScore?: number;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsUrl({}, { message: "Website URL must be a valid URL" })
  @MaxLength(300)
  websiteUrl?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  @MaxLength(500)
  notes?: string;
}
