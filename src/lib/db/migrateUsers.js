const dbUrl = 'postgresql://neondb_owner:npg_NC4Mv7JZGRiD@ep-late-union-b3a172jf.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const host = 'ep-late-union-b3a172jf.c-4.ap-southeast-1.aws.neon.tech';

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
  console.log('1. Creating users table in Neon Postgres...');
  const tableRes = await executeSql(`
    CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY,
      name text NOT NULL,
      email text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      role text DEFAULT 'Analyst' NOT NULL,
      created_at timestamp with time zone DEFAULT now() NOT NULL,
      updated_at timestamp with time zone DEFAULT now() NOT NULL
    );
  `);
  console.log('Table create status:', tableRes.status);

  console.log('2. Verifying users columns in Neon Postgres...');
  const check = await executeSql(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users'
    ORDER BY ordinal_position;
  `);
  console.log('Columns:');
  console.table(check.data.rows);
}

run().catch(console.error);
