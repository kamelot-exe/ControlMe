import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ApiResponse } from '@/shared/types';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === '[object Object]';

const normalizeDecimals = (value: unknown): unknown => {
  if (Prisma.Decimal.isDecimal(value)) {
    return value.toNumber();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeDecimals);
  }

  if (value instanceof Date || value instanceof Buffer) {
    return value;
  }

  if (isPlainObject(value)) {
    const normalized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      normalized[key] = normalizeDecimals(val);
    }
    return normalized;
  }

  return value;
};

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        data: normalizeDecimals(data) as T,
      })),
    );
  }
}

