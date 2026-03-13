import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CatalogService } from "./catalog.service";

@Controller("catalog")
@UseGuards(JwtAuthGuard)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  search(
    @Query("query") query?: string,
    @Query("region") region?: string,
    @Query("country") country?: string,
    @Query("group") group?: string,
    @Query("limit") limit?: string,
  ) {
    return this.catalogService.search({
      query,
      region,
      country,
      group,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get("summary")
  summary() {
    return this.catalogService.summary();
  }
}
