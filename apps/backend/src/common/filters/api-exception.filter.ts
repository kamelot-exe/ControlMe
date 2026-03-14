import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";
import type { ApiErrorResponse } from "@/shared/types";

type ErrorPayload = {
  code: string;
  details?: unknown;
  message: string;
  statusCode: number;
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const error = this.resolveException(exception);

    if (error.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.originalUrl} -> ${error.statusCode} ${error.message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const payload: ApiErrorResponse = {
      data: null,
      message: error.message,
      error: {
        code: error.code,
        details: error.details,
        message: error.message,
        statusCode: error.statusCode,
      },
    };

    response.status(error.statusCode).json(payload);
  }

  private resolveException(exception: unknown): ErrorPayload {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === "string") {
        return {
          code: exception.name,
          message: response,
          statusCode,
        };
      }

      const body = response as {
        details?: unknown;
        error?: string;
        message?: string | string[];
      };
      const details = Array.isArray(body.message) ? body.message : body.details;
      const message = Array.isArray(body.message)
        ? body.message.join("; ")
        : body.message ?? exception.message;

      return {
        code: body.error ?? exception.name,
        details,
        message,
        statusCode,
      };
    }

    if (exception instanceof Error) {
      return {
        code: exception.name || "InternalServerError",
        message: exception.message || "Internal server error",
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }

    return {
      code: "InternalServerError",
      message: "Internal server error",
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }
}
