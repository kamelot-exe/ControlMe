import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";

@Injectable()
export class InternalJobGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const secret = this.configService.get<string>("INTERNAL_JOB_TOKEN");
    if (!secret) {
      throw new ServiceUnavailableException(
        "INTERNAL_JOB_TOKEN environment variable is required for this endpoint",
      );
    }

    const request = context.switchToHttp().getRequest<Request>();
    const headerToken = request.header("x-job-token");

    if (!headerToken || headerToken !== secret) {
      throw new UnauthorizedException("Invalid internal job token");
    }

    return true;
  }
}
