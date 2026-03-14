import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { SUPPORTED_CURRENCIES } from "../../common/constants/domain.constants";
import { Currency } from "@/shared/types";

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsIn(SUPPORTED_CURRENCIES)
  currency?: Currency;
}
