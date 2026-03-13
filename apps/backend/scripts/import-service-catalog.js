const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const sourcePath = path.resolve(__dirname, "../../../deep-research-report.md");
const CHUNK_SIZE = 200;

function normalizeWebsite(value) {
  const website = String(value || "").trim();
  if (!website) {
    return "https://example.com";
  }
  if (website.startsWith("http://") || website.startsWith("https://")) {
    return website;
  }
  return `https://${website}`;
}

function normalizeEntry(entry) {
  return {
    service: String(entry.service || "").trim(),
    group: String(entry.group || "").trim(),
    subcategory: String(entry.subcategory || "").trim(),
    similarityGroup: String(entry.similarityGroup || "").trim(),
    region: String(entry.region || "").trim(),
    country: String(entry.country || "").trim(),
    plan: String(entry.plan || "").trim(),
    price: Number(entry.price || 0),
    currency: String(entry.currency || "").trim(),
    billingPeriod: String(entry.billingPeriod || "").trim(),
    website: normalizeWebsite(entry.website),
    logoHint: String(entry.logoHint || "").trim(),
    priority: String(entry.priority || "medium").trim(),
    defaultNeedScore: Math.min(Math.max(Number(entry.defaultNeedScore || 0), 0), 100),
    planRank: Math.max(Number(entry.planRank || 1), 1),
    isFamilyPlan: Boolean(entry.isFamilyPlan),
    isStudentPlan: Boolean(entry.isStudentPlan),
    isBusinessPlan: Boolean(entry.isBusinessPlan),
  };
}

async function main() {
  const raw = fs.readFileSync(sourcePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("deep-research-report.md must contain a JSON array");
  }

  const entries = parsed
    .map(normalizeEntry)
    .filter((entry) =>
      entry.service &&
      entry.group &&
      entry.subcategory &&
      entry.similarityGroup &&
      entry.region &&
      entry.country &&
      entry.plan &&
      Number.isFinite(entry.price) &&
      entry.currency &&
      entry.billingPeriod &&
      entry.logoHint
    );

  await prisma.serviceCatalogEntry.deleteMany();

  for (let index = 0; index < entries.length; index += CHUNK_SIZE) {
    const chunk = entries.slice(index, index + CHUNK_SIZE);
    await prisma.serviceCatalogEntry.createMany({
      data: chunk,
    });
  }

  const count = await prisma.serviceCatalogEntry.count();
  console.log(`Imported ${count} service catalog entries from ${path.basename(sourcePath)}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
