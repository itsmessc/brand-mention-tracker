import { faker } from '@faker-js/faker';
import { connectDb, disconnectDb } from '../src/config/db.js';
import { Brand } from '../src/models/Brand.js';
import { Mention } from '../src/models/Mention.js';
import { SavedView } from '../src/models/SavedView.js';
import { SOURCES, SENTIMENTS } from '../src/models/Mention.js';

const PER_BRAND = Number(process.env.SEED_PER_BRAND ?? 5000);
const DAYS_BACK = 90;

const BRANDS = [
  { name: 'Acme', keywords: ['acme', 'acme corp', 'wile e'] },
  { name: 'Globex', keywords: ['globex', 'globex corp', 'hank scorpio'] },
  { name: 'Initech', keywords: ['initech', 'tps report', 'lumbergh'] },
];

const TAG_POOL = [
  'support', 'bug', 'feature-request', 'pricing', 'ux', 'performance',
  'launch', 'praise', 'complaint', 'question', 'press', 'churn',
];

const SOURCE_WEIGHTS = [
  { value: 'twitter', weight: 0.45 },
  { value: 'reddit', weight: 0.25 },
  { value: 'instagram', weight: 0.15 },
  { value: 'news', weight: 0.15 },
];

const SENTIMENT_WEIGHTS = [
  { value: 'positive', weight: 0.4 },
  { value: 'neutral', weight: 0.4 },
  { value: 'negative', weight: 0.2 },
];

function weighted(buckets) {
  const r = Math.random();
  let acc = 0;
  for (const b of buckets) {
    acc += b.weight;
    if (r <= acc) return b.value;
  }
  return buckets[buckets.length - 1].value;
}

function pickTags() {
  const n = faker.number.int({ min: 0, max: 3 });
  const out = new Set();
  for (let i = 0; i < n; i += 1) {
    out.add(faker.helpers.arrayElement(TAG_POOL));
  }
  return [...out];
}

function fakeMention(brandId, brandName) {
  const source = weighted(SOURCE_WEIGHTS);
  const postedAt = faker.date.recent({ days: DAYS_BACK });
  const id = faker.string.alphanumeric(16);
  return {
    brand: brandId,
    source,
    author: faker.internet.username(),
    body: `${faker.lorem.sentence({ min: 8, max: 20 })} ${brandName.toLowerCase()}`,
    url: `https://${source}.example.com/${id}`,
    externalId: id,
    postedAt,
    sentiment: weighted(SENTIMENT_WEIGHTS),
    tags: pickTags(),
  };
}

async function main() {
  console.log(`[seed] connecting...`);
  await connectDb();

  console.log(`[seed] wiping collections`);
  await Promise.all([Mention.deleteMany({}), Brand.deleteMany({}), SavedView.deleteMany({})]);

  console.log(`[seed] creating ${BRANDS.length} brands`);
  const brands = await Brand.insertMany(BRANDS);

  for (const brand of brands) {
    console.log(`[seed] generating ${PER_BRAND} mentions for ${brand.name}`);
    const batch = [];
    for (let i = 0; i < PER_BRAND; i += 1) {
      batch.push(fakeMention(brand._id, brand.name));
      if (batch.length >= 1000) {
        await Mention.insertMany(batch, { ordered: false });
        batch.length = 0;
      }
    }
    if (batch.length > 0) await Mention.insertMany(batch, { ordered: false });
  }

  const total = await Mention.countDocuments();
  console.log(`[seed] done. total mentions: ${total}`);
  await disconnectDb();
}

main().catch(async (err) => {
  console.error('[seed] failed', err);
  await disconnectDb();
  process.exit(1);
});
