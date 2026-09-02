// ─── Neon Serverless Postgres Client (HTTP Mode) ───

export interface DbRiskParameter {
  id: string;
  name: string;
  taxonomy: string;
  status: string;
  currentValue: string;
  period: string;
  appetiteThreshold?: string | null;
  toleranceThreshold?: string | null;
  limitThreshold?: string | null;
  triggerThreshold?: string | null;
  createdAt: string;
  updatedAt: string;
}

function getDbConfig() {
  const dbUrl = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error(
      'DATABASE_URL is not set in environment variables. ' +
      'Add your Neon pooled connection string to .env.local.'
    );
  }

  // Parse host from postgres connection string
  // Format: postgresql://user:pass@host/dbname...
  const match = dbUrl.match(/@([^/:]+)/);
  const host = match ? match[1] : '';

  return { dbUrl, host };
}

export async function queryNeon<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const { dbUrl, host } = getDbConfig();

  // Simple parametrized query substitution for Postgres
  let parametrizedSql = sql;
  params.forEach((val, idx) => {
    const placeholder = `$${idx + 1}`;
    let escapedVal: string;
    if (val === null || val === undefined) {
      escapedVal = 'NULL';
    } else if (typeof val === 'number') {
      escapedVal = String(val);
    } else if (val instanceof Date) {
      escapedVal = `'${val.toISOString()}'`;
    } else {
      escapedVal = `'${String(val).replace(/'/g, "''")}'`;
    }
    parametrizedSql = parametrizedSql.replace(new RegExp(`\\${placeholder}\\b`, 'g'), escapedVal);
  });

  const endpoint = `https://${host}/sql`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Neon-Connection-String': dbUrl,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: parametrizedSql }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Neon Postgres error (${res.status}): ${errData.message || res.statusText}`);
  }

  const json = await res.json();
  const rows = json.rows || [];

  // Convert snake_case column names to camelCase while preserving original fields
  return rows.map((r: Record<string, any>) => {
    const obj: Record<string, any> = {};
    for (const [key, value] of Object.entries(r)) {
      obj[key] = value;
      // Convert snake_case to camelCase (e.g. current_value -> currentValue, password_hash -> passwordHash)
      const camelKey = key.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
      if (camelKey !== key) {
        obj[camelKey] = value;
      }
    }
    return obj;
  }) as T[];
}
