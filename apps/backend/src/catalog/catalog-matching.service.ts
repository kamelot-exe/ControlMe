import { Injectable } from "@nestjs/common";
import type { ServiceCatalogEntry } from "@prisma/client";
import { CacheService } from "../cache/cache.service";
import { CatalogService } from "./catalog.service";

function normalize(value?: string | null) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

@Injectable()
export class CatalogMatchingService {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly cacheService: CacheService,
  ) {}

  async match(query: string) {
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      return null;
    }

    const cacheKey = `catalog:match:${normalizedQuery}`;
    const { value } = await this.cacheService.wrap(cacheKey, 300, async () => {
      const candidates = await this.catalogService.search({
        page: 1,
        pageSize: 20,
        skip: 0,
        query,
        limit: 25,
      });

      if (candidates.length === 0) {
        return null;
      }

      const scored = candidates
        .map((entry) => ({
          entry,
          confidence: this.scoreEntry(entry, normalizedQuery),
        }))
        .sort(
          (left, right) =>
            right.confidence - left.confidence ||
            left.entry.planRank - right.entry.planRank,
        );

      const best = scored[0];
      if (!best || best.confidence < 0.45) {
        return null;
      }

      return {
        confidence: Number(best.confidence.toFixed(2)),
        id: best.entry.id,
        service: best.entry.service,
        plan: best.entry.plan,
        group: best.entry.group,
        subcategory: best.entry.subcategory,
        similarityGroup: best.entry.similarityGroup,
        region: best.entry.region,
        country: best.entry.country,
        website: best.entry.website,
        logoHint: best.entry.logoHint,
        price: Number(best.entry.price),
        currency: best.entry.currency,
        billingPeriod: best.entry.billingPeriod,
        defaultNeedScore: best.entry.defaultNeedScore,
        priority: best.entry.priority,
        planRank: best.entry.planRank,
        isFamilyPlan: best.entry.isFamilyPlan,
        isStudentPlan: best.entry.isStudentPlan,
        isBusinessPlan: best.entry.isBusinessPlan,
      };
    });

    return value;
  }

  private scoreEntry(entry: ServiceCatalogEntry, query: string) {
    const service = normalize(entry.service);
    const plan = normalize(entry.plan);
    const combined = `${service} ${plan}`.trim();

    if (combined === query) return 0.99;
    if (service === query) return 0.96;
    if (query.startsWith(service)) return 0.92;
    if (combined.startsWith(query)) return 0.88;
    if (service.startsWith(query)) return 0.84;
    if (combined.includes(query)) return 0.78;
    if (query.includes(service)) return 0.74;

    const queryTokens = query.split(" ");
    const combinedTokens = new Set(combined.split(" "));
    const matchedTokens = queryTokens.filter((token) =>
      combinedTokens.has(token),
    ).length;
    return matchedTokens / Math.max(queryTokens.length, 1);
  }
}
