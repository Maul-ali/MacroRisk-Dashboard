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
  console.log('1. Creating Enum Types in Neon Postgres...');
  
  await executeSql(`
    DO $$ BEGIN
      CREATE TYPE risk_status AS ENUM (
        'Within Limit',
        'Within Appetite',
        'Within Tolerance',
        '> Tolerance',
        '> Trigger Level'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await executeSql(`
    DO $$ BEGIN
      CREATE TYPE risk_taxonomy AS ENUM (
        'Strategic Risk',
        'Market and Macroeconomic Risk',
        'Financial Risk',
        'Credit/Counterparty Risk',
        'Operational Risk',
        'Investment/Project Risk',
        'Reputational Risk',
        'Regulatory, Legal & Compliance Risk'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  console.log('2. Creating table risk_parameters in Neon Postgres...');
  const tableRes = await executeSql(`
    CREATE TABLE IF NOT EXISTS risk_parameters (
      id text PRIMARY KEY,
      name text NOT NULL,
      taxonomy risk_taxonomy NOT NULL,
      status risk_status NOT NULL,
      current_value text NOT NULL,
      period text NOT NULL,
      appetite_threshold text,
      tolerance_threshold text,
      limit_threshold text,
      trigger_threshold text,
      created_at timestamp with time zone DEFAULT now() NOT NULL,
      updated_at timestamp with time zone DEFAULT now() NOT NULL
    );
  `);
  console.log('Table create status:', tableRes.status);

  console.log('3. Verifying columns in Neon Postgres...');
  const check = await executeSql(`
    SELECT column_name, data_type, udt_name 
    FROM information_schema.columns 
    WHERE table_name = 'risk_parameters'
    ORDER BY ordinal_position;
  `);
  console.log('Columns created successfully:');
  console.table(check.data.rows);
}

run().catch(console.error);
