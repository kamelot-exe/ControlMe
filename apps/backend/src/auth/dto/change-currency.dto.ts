import { Transform } from "class-transformer";
import { IsIn } from "class-validator";
import { SUPPORTED_CURRENCIES } from "../../common/constants/domain.constants";
import type { Currency } from "@/shared/types";

export class ChangeCurrencyDto {
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toUpperCase() : value,
  )
  @IsIn(SUPPORTED_CURRENCIES)
  currency!: Currency;
}
