import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from "class-validator";

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  prechargeReminderDays?: number;

  @IsOptional()
  @IsBoolean()
  smartAlertsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  renewalEmailsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  unusedEmailsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  weeklyDigestEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  monthlyDigestEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  weeklyDigestDay?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  monthlyDigestDay?: number;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "digestTime must use HH:MM format",
  })
  digestTime?: string;

  @IsOptional()
  @IsString()
  timeZone?: string;
}
