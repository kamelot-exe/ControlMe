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
} from "class-validator";
import { BillingPeriod } from "@/shared/types";

export class CreateSubscriptionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsNumber()
  @Min(0.01, { message: "Price must be greater than 0" })
  price: number;

  @IsIn(["MONTHLY", "YEARLY"])
  billingPeriod: BillingPeriod;

  @IsDateString()
  nextChargeDate: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  category: string;

  @IsOptional()
  @IsUrl({}, { message: "Website URL must be a valid URL" })
  @MaxLength(300)
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
