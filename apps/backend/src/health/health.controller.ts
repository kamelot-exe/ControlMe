import { Controller, Get, Header, HttpCode } from "@nestjs/common";
import { HealthService } from "./health.service";

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get("health/live")
  @HttpCode(200)
  getLiveness() {
    return this.healthService.getLiveness();
  }

  @Get("health/ready")
  @HttpCode(200)
  getReadiness() {
    return this.healthService.getReadiness();
  }

  @Get("metrics")
  @Header("Content-Type", "text/plain; version=0.0.4")
  getMetrics() {
    return this.healthService.getMetrics();
  }
}
