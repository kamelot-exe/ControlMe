import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CatalogMatchingService } from "./catalog-matching.service";
import { CatalogService } from "./catalog.service";
import { CatalogSearchQueryDto } from "./dto/catalog-search-query.dto";

@Controller("catalog")
@UseGuards(JwtAuthGuard)
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly catalogMatchingService: CatalogMatchingService,
  ) {}

  @Get()
  search(@Query() query: CatalogSearchQueryDto) {
    return this.catalogService.search(query);
  }

  @Get("list")
  list(@Query() query: CatalogSearchQueryDto) {
    return this.catalogService.list(query);
  }

  @Get("summary")
  summary() {
    return this.catalogService.summary();
  }

  @Get("match")
  match(@Query("query") query?: string) {
    return this.catalogMatchingService.match(query ?? "");
  }
}
