import Papa from 'papaparse';

const MENTION_FIELDS = [
  '_id',
  'source',
  'author',
  'body',
  'url',
  'externalId',
  'postedAt',
  'sentiment',
  'tags',
  'createdAt',
];

function rowFor(mention) {
  return {
    _id: String(mention._id),
    source: mention.source,
    author: mention.author ?? '',
    body: (mention.body ?? '').replace(/\r?\n/g, ' '),
    url: mention.url ?? '',
    externalId: mention.externalId ?? '',
    postedAt: mention.postedAt ? new Date(mention.postedAt).toISOString() : '',
    sentiment: mention.sentiment ?? '',
    tags: Array.isArray(mention.tags) ? mention.tags.join('|') : '',
    createdAt: mention.createdAt ? new Date(mention.createdAt).toISOString() : '',
  };
}

export async function streamMentionsAsCsv(cursor, res) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="mentions.csv"');

  res.write(MENTION_FIELDS.join(',') + '\n');
  for await (const doc of cursor) {
    const line = Papa.unparse([rowFor(doc)], { header: false, columns: MENTION_FIELDS });
    res.write(line + '\n');
  }
  res.end();
}
