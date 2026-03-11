import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, IsBoolean, Min, MinLength, MaxLength } from 'class-validator';
import { BillingPeriod } from '@/shared/types';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01, { message: 'Price must be greater than 0' })
  price?: number;

  @IsOptional()
  @IsEnum(['MONTHLY', 'YEARLY'])
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
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

