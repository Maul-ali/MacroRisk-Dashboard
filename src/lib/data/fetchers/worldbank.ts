// ─── World Bank Open Macro & Pink Sheet Fetcher ───
// Fetches official Indonesia CPI Inflation, Real GDP growth rates, and Pink Sheet Phosphate Rock.

import zlib from 'zlib';

export interface MacroResult {
  id: string;
  value: number;
  change1M: number | null;
  lastUpdated: string;
  source: string;
}

export interface PinkSheetResult {
  id: string;
  value: number;
  change1M: number | null;
  lastUpdated: string;
  source: string;
}

export async function fetchWorldBankIndicator(
  indicatorCode: string
): Promise<{ value: number; date: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://api.worldbank.org/v2/country/IDN/indicator/${indicatorCode}?format=json&per_page=5`;
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 86400 }, // Cache 24h
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    const records = data?.[1];
    if (!records || !Array.isArray(records)) return null;

    const validRecord = records.find(
      (r: { value: number | null }) => r.value !== null && !isNaN(r.value)
    );
    if (!validRecord) return null;

    return {
      value: Math.round(validRecord.value * 100) / 100,
      date: validRecord.date || new Date().getFullYear().toString(),
    };
  } catch {
    return null;
  }
}

export async function fetchLiveMacro(): Promise<Record<string, MacroResult>> {
  const results: Record<string, MacroResult> = {};
  const nowIso = new Date().toISOString();

  // CPI Inflation YoY (FP.CPI.TOTL.ZG)
  const cpi = await fetchWorldBankIndicator('FP.CPI.TOTL.ZG');
  if (cpi) {
    results['cpi-yoy'] = {
      id: 'cpi-yoy',
      value: cpi.value,
      change1M: null,
      lastUpdated: nowIso,
      source: 'World Bank Open Data',
    };
  }

  // Real GDP Growth YoY (NY.GDP.MKTP.KD.ZG)
  const gdp = await fetchWorldBankIndicator('NY.GDP.MKTP.KD.ZG');
  if (gdp) {
    const gdpResult: MacroResult = {
      id: 'real-gdp-yoy',
      value: gdp.value,
      change1M: null,
      lastUpdated: nowIso,
      source: 'World Bank Open Data',
    };
    results['real-gdp-yoy'] = gdpResult;
    results['real-gdp'] = { ...gdpResult, id: 'real-gdp' };
  }

  return results;
}

function extractZipFile(buffer: Buffer, targetFileName: string): string | null {
  const eocdOffset = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocdOffset === -1) return null;

  const cdCount = buffer.readUInt16LE(eocdOffset + 10);
  const cdOffset = buffer.readUInt32LE(eocdOffset + 16);

  let pos = cdOffset;
  for (let i = 0; i < cdCount; i++) {
    if (buffer.readUInt32LE(pos) !== 0x02014b50) break;
    const method = buffer.readUInt16LE(pos + 10);
    const compSize = buffer.readUInt32LE(pos + 20);
    const nameLen = buffer.readUInt16LE(pos + 28);
    const extraLen = buffer.readUInt16LE(pos + 30);
    const commentLen = buffer.readUInt16LE(pos + 32);
    const localHeaderOffset = buffer.readUInt32LE(pos + 42);

    const fileName = buffer.toString('utf8', pos + 46, pos + 46 + nameLen);
    pos += 46 + nameLen + extraLen + commentLen;

    if (fileName === targetFileName) {
      const localNameLen = buffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLen = buffer.readUInt16LE(localHeaderOffset + 28);
      const dataOffset = localHeaderOffset + 30 + localNameLen + localExtraLen;
      const compData = buffer.subarray(dataOffset, dataOffset + compSize);

      if (method === 0) return compData.toString('utf8');
      if (method === 8) return zlib.inflateRawSync(compData).toString('utf8');
    }
  }
  return null;
}

export async function fetchLivePinkSheet(): Promise<Record<string, PinkSheetResult>> {
  const results: Record<string, PinkSheetResult> = {};
  const nowIso = new Date().toISOString();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const url =
      'https://thedocs.worldbank.org/en/doc/5d903e848db1d1b83e0ec8f744e55570-0350012021/related/CMO-Historical-Data-Monthly.xlsx';
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 86400 }, // Cache 24h
    });
    clearTimeout(timeout);

    if (!res.ok) return results;

    const arrayBuf = await res.arrayBuffer();
    const buf = Buffer.from(arrayBuf);

    const sharedXml = extractZipFile(buf, 'xl/sharedStrings.xml');
    const sheetXml = extractZipFile(buf, 'xl/worksheets/sheet2.xml');
    if (!sharedXml || !sheetXml) return results;

    const strings = [...sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((si) =>
      [...si[1].matchAll(/<t[^>]*>(.*?)<\/t>/g)].map((t) => t[1]).join('')
    );

    // Find Phosphate Rock column from row 5
    const row5Match = sheetXml.match(/<row r="5"[^>]*>([\s\S]*?)<\/row>/);
    let phosCol = 'BF';
    if (row5Match) {
      const cellRegex = /<c\s+r="([A-Z]+)\d+"([^>]*)>(?:<f>[\s\S]*?<\/f>)?(?:<v>(.*?)<\/v>)?<\/c>/g;
      for (const m of row5Match[1].matchAll(cellRegex)) {
        const col = m[1];
        const isString = m[2].includes('t="s"');
        const text = isString ? strings[parseInt(m[3])] : m[3];
        if (text && text.toLowerCase().includes('phosphate rock')) {
          phosCol = col;
          break;
        }
      }
    }

    // Extract all rows in sheet2
    const allRows = [...sheetXml.matchAll(/<row r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)];
    if (allRows.length === 0) return results;

    // Scan backwards from the last row to find latest valid value for phosCol
    for (let i = allRows.length - 1; i >= Math.max(0, allRows.length - 20); i--) {
      const rowXml = allRows[i][2];
      const phosCellMatch = rowXml.match(
        new RegExp(`<c\\s+r="${phosCol}\\d+"([^>]*)>(?:<f>[\\s\\S]*?</f>)?(?:<v>(.*?)</v>)?<\\/c>`)
      );
      if (phosCellMatch && phosCellMatch[2]) {
        const val = Number(phosCellMatch[2]);
        if (!isNaN(val) && val > 0) {
          results['phosphate-rock'] = {
            id: 'phosphate-rock',
            value: Math.round(val * 100) / 100,
            change1M: null,
            lastUpdated: nowIso,
            source: 'World Bank Pink Sheet',
          };
          break;
        }
      }
    }
  } catch (err) {
    console.warn('[World Bank Pink Sheet] Failed to fetch pink sheet:', err);
  }

  return results;
}
