import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { CacheService } from "../cache/cache.service";
import { buildPaginatedResponse } from "../common/utils/pagination.util";
import { PrismaService } from "../prisma/prisma.service";
import { CatalogSearchQueryDto } from "./dto/catalog-search-query.dto";

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async search(params: CatalogSearchQueryDto) {
    const cacheKey = `catalog:search:${JSON.stringify(params)}`;

    const { value } = await this.cacheService.wrap(cacheKey, 300, async () => {
      const limit = Math.min(Math.max(params.limit ?? 40, 1), 100);

      return this.prisma.serviceCatalogEntry.findMany({
        where: this.buildWhereClause(params),
        orderBy: [
          { priority: "asc" },
          { region: "asc" },
          { country: "asc" },
          { service: "asc" },
          { planRank: "asc" },
        ],
        take: limit,
      });
    });

    return value;
  }

  async list(params: CatalogSearchQueryDto) {
    const cacheKey = `catalog:list:${JSON.stringify(params)}`;

    const { value } = await this.cacheService.wrap(cacheKey, 300, async () => {
      const where = this.buildWhereClause(params);
      const [total, items] = await this.prisma.$transaction([
        this.prisma.serviceCatalogEntry.count({ where }),
        this.prisma.serviceCatalogEntry.findMany({
          where,
          orderBy: [
            { priority: "asc" },
            { region: "asc" },
            { country: "asc" },
            { service: "asc" },
            { planRank: "asc" },
          ],
          skip: params.skip,
          take: params.pageSize,
        }),
      ]);

      return buildPaginatedResponse(items, total, params.page, params.pageSize);
    });

    return value;
  }

  async summary() {
    const { value } = await this.cacheService.wrap("catalog:summary", 900, async () => {
      const [count, regions, groups, countries] = await Promise.all([
        this.prisma.serviceCatalogEntry.count(),
        this.prisma.serviceCatalogEntry.findMany({
          distinct: ["region"],
          select: { region: true },
          orderBy: { region: "asc" },
        }),
        this.prisma.serviceCatalogEntry.findMany({
          distinct: ["group"],
          select: { group: true },
          orderBy: { group: "asc" },
        }),
        this.prisma.serviceCatalogEntry.findMany({
          distinct: ["country"],
          select: { country: true },
          orderBy: { country: "asc" },
          take: 150,
        }),
      ]);

      return {
        count,
        regions: regions.map((item) => item.region),
        groups: groups.map((item) => item.group),
        countries: countries.map((item) => item.country),
      };
    });

    return value;
  }

  private buildWhereClause(
    params: CatalogSearchQueryDto,
  ): Prisma.ServiceCatalogEntryWhereInput {
    const { query, region, country, group, minPrice, maxPrice } = params;

    return {
      ...(region ? { region } : {}),
      ...(country ? { country } : {}),
      ...(group ? { group } : {}),
      ...(minPrice != null || maxPrice != null
        ? {
            price: {
              ...(minPrice != null ? { gte: minPrice } : {}),
              ...(maxPrice != null ? { lte: maxPrice } : {}),
            },
          }
        : {}),
      ...(query
        ? {
            OR: [
              { service: { contains: query, mode: "insensitive" } },
              { plan: { contains: query, mode: "insensitive" } },
              { group: { contains: query, mode: "insensitive" } },
              { country: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  }
}
