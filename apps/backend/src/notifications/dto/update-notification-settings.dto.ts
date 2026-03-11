import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  prechargeReminderDays?: number;

  @IsOptional()
  @IsBoolean()
  smartAlertsEnabled?: boolean;
}
