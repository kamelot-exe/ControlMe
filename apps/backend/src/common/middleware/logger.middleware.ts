import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get("user-agent") || "";
    const start = Date.now();

    res.on("finish", () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      const color =
        statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "log";

      this.logger[color](
        `${method} ${originalUrl} ${statusCode} ${duration}ms — ${ip} ${userAgent}`,
      );
    });

    next();
  }
}
