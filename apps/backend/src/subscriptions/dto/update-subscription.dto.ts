import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsBoolean,
  Min,
  MinLength,
  MaxLength,
  IsIn,
  IsUrl,
} from "class-validator";
import { BillingPeriod } from "@/shared/types";

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01, { message: "Price must be greater than 0" })
  price?: number;

  @IsOptional()
  @IsIn(["MONTHLY", "YEARLY"])
  billingPeriod?: BillingPeriod;

  @IsOptional()
  @IsDateString()
  nextChargeDate?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsUrl({}, { message: "Website URL must be a valid URL" })
  @MaxLength(300)
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
