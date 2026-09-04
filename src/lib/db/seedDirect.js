const fs = require('fs');

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

async function seed() {
  console.log('🌱 Starting seed of 43 Risk Parameters into Neon Postgres...');

  // Read raw parameters from riskProfileData.ts
  const rawFile = fs.readFileSync('./src/lib/data/riskProfileData.ts', 'utf-8');
  
  // Extract PARAMETERS array block
  const match = rawFile.match(/const PARAMETERS:\s*RiskParameter\[\]\s*=\s*(\[[\s\S]*?\]);\s*\/\/\s*───\s*Taxonomy/);
  if (!match) {
    throw new Error('Could not parse PARAMETERS array from riskProfileData.ts');
  }

  // Safely parse JS objects into parameters list
  const sanitized = match[1]
    .replace(/\/\/.*/g, '') // remove line comments
    .replace(/,\s*([\]}])/g, '$1'); // remove trailing commas

  const parameters = eval(sanitized);
  console.log(`Parsed ${parameters.length} parameters from riskProfileData.ts.`);

  let insertedCount = 0;
  for (const p of parameters) {
    const esc = (val) => val ? `'${val.replace(/'/g, "''")}'` : 'NULL';
    
    const query = `
      INSERT INTO risk_parameters (
        id, name, taxonomy, status, current_value, period,
        appetite_threshold, tolerance_threshold, limit_threshold, trigger_threshold,
        updated_at
      ) VALUES (
        ${esc(p.id)},
        ${esc(p.name)},
        ${esc(p.taxonomy)}::risk_taxonomy,
        ${esc(p.status)}::risk_status,
        ${esc(p.currentValue)},
        ${esc(p.period)},
        ${esc(p.appetiteThreshold)},
        ${esc(p.toleranceThreshold)},
        ${esc(p.limitThreshold)},
        ${esc(p.triggerThreshold)},
        NOW()
      )
      ON CONFLICT (id) DO NOTHING;
    `;

    const res = await executeSql(query);
    if (res.status === 200) {
      insertedCount++;
    } else {
      console.error(`Failed to insert ${p.id}:`, res.data);
    }
  }

  console.log(`✅ Seed finished! Processed ${insertedCount} rows.`);

  // Verify total count in table
  const countRes = await executeSql('SELECT COUNT(*) as total_rows FROM risk_parameters;');
  console.log('📊 Total rows in Neon risk_parameters table:', countRes.data.rows[0].total_rows);

  // Status distribution breakdown in DB
  const statusRes = await executeSql(`
    SELECT status, COUNT(*) as count 
    FROM risk_parameters 
    GROUP BY status 
    ORDER BY count DESC;
  `);
  console.log('📈 Status distribution in Neon Postgres:');
  console.table(statusRes.data.rows);
}

seed().catch(console.error);
