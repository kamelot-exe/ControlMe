import { Type } from "class-transformer";
import { IsNumber, Max, Min, ValidateIf } from "class-validator";

export class SetBudgetLimitDto {
  @ValidateIf((_object, value) => value !== null)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1_000_000)
  budgetLimit!: number | null;
}
