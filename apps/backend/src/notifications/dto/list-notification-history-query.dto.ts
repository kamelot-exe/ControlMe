import { IsIn, IsOptional } from "class-validator";
import {
  NOTIFICATION_DELIVERY_STATUSES,
  NOTIFICATION_DELIVERY_TYPES,
} from "../../common/constants/domain.constants";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class ListNotificationHistoryQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(NOTIFICATION_DELIVERY_TYPES)
  type?: (typeof NOTIFICATION_DELIVERY_TYPES)[number];

  @IsOptional()
  @IsIn(NOTIFICATION_DELIVERY_STATUSES)
  status?: (typeof NOTIFICATION_DELIVERY_STATUSES)[number];
}
