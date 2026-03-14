import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");
  private readonly useJsonLogs =
    process.env.LOG_FORMAT === "json" || process.env.NODE_ENV === "production";

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get("user-agent") || "";
    const start = Date.now();
    const requestId = req.get("x-request-id") || randomUUID();

    res.setHeader("x-request-id", requestId);

    res.on("finish", () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      const level =
        statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "log";
      const payload = {
        context: "http",
        requestId,
        method,
        path: originalUrl,
        statusCode,
        durationMs: duration,
        ip,
        userAgent,
        contentLength: res.getHeader("content-length") ?? null,
        timestamp: new Date().toISOString(),
      };

      if (this.useJsonLogs) {
        this.logger[level](JSON.stringify(payload));
        return;
      }

      this.logger[level](
        `${method} ${originalUrl} ${statusCode} ${duration}ms - ${ip} ${userAgent} [${requestId}]`,
      );
    });

    next();
  }
}
