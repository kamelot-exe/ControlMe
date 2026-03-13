import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async search(params: {
    query?: string;
    region?: string;
    country?: string;
    group?: string;
    limit?: number;
  }) {
    const { query, region, country, group } = params;
    const limit = Math.min(Math.max(params.limit ?? 40, 1), 100);

    const where: Prisma.ServiceCatalogEntryWhereInput = {
      ...(region ? { region } : {}),
      ...(country ? { country } : {}),
      ...(group ? { group } : {}),
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

    return this.prisma.serviceCatalogEntry.findMany({
      where,
      orderBy: [
        { priority: "asc" },
        { region: "asc" },
        { country: "asc" },
        { service: "asc" },
        { planRank: "asc" },
      ],
      take: limit,
    });
  }

  async summary() {
    const [count, regions, groups] = await Promise.all([
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
    ]);

    return {
      count,
      regions: regions.map((item) => item.region),
      groups: groups.map((item) => item.group),
    };
  }
}
