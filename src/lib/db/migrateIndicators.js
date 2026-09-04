const dbUrl = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_NC4Mv7JZGRiD@ep-late-union-b3a172jf.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const match = dbUrl.match(/@([^/:]+)/);
const host = match ? match[1] : 'ep-late-union-b3a172jf.c-4.ap-southeast-1.aws.neon.tech';

async function executeSql(sql) {
  const res = await fetch('https://' + host + '/sql', {
    method: 'POST',
    headers: {
      'Neon-Connection-String': dbUrl,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function run() {
  console.log('1. Creating indicator_cache table in Neon Postgres...');
  const cacheRes = await executeSql(`
    CREATE TABLE IF NOT EXISTS indicator_cache (
      id text PRIMARY KEY,
      payload jsonb NOT NULL,
      updated_at timestamptz DEFAULT now() NOT NULL
    );
  `);
  console.log('indicator_cache create status:', cacheRes.status, cacheRes.data);

  console.log('2. Creating indicator_history table in Neon Postgres...');
  const historyRes = await executeSql(`
    CREATE TABLE IF NOT EXISTS indicator_history (
      id serial PRIMARY KEY,
      indicator_id text NOT NULL,
      value numeric NOT NULL,
      fetched_at timestamptz DEFAULT now() NOT NULL
    );
  `);
  console.log('indicator_history create status:', historyRes.status, historyRes.data);

  const indexRes = await executeSql(`
    CREATE INDEX IF NOT EXISTS idx_indicator_history_lookup ON indicator_history(indicator_id, fetched_at DESC);
  `);
  console.log('index create status:', indexRes.status, indexRes.data);

  console.log('3. Verifying tables in database...');
  const check = await executeSql(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.table(check.data.rows);
}

run().catch(console.error);
