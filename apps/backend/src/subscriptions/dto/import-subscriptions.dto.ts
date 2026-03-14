import { IsString, MinLength } from "class-validator";

export class ImportSubscriptionsDto {
  @IsString()
  @MinLength(1)
  csv!: string;
}
