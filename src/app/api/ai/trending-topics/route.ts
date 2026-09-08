import { NextResponse } from 'next/server';

function extractAndParseJSON(rawText: string) {
  try {
    return JSON.parse(rawText.trim());
  } catch {
    const match = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        // continue
      }
    }
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
    }
    throw new Error('Could not parse JSON from model output');
  }
}

async function callGeminiWithFailover(prompt: string, keys: string[]) {
  let lastError = '';
  for (const key of keys) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawOutput) {
          return extractAndParseJSON(rawOutput);
        }
      } else {
        const errText = await response.text();
        lastError = `Gemini HTTP ${response.status}: ${errText}`;
        console.warn(`Gemini key failed, attempting backup: ${lastError}`);
      }
    } catch (e: any) {
      lastError = e?.message || String(e);
      console.warn(`Gemini error: ${lastError}`);
    }
  }
  throw new Error(`All Gemini keys failed. Last error: ${lastError}`);
}

export async function POST(req: Request) {
  try {
    const geminiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_BACKUP,
    ].filter((k): k is string => Boolean(k));

    if (geminiKeys.length === 0) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in .env.local.' },
        { status: 500 }
      );
    }

    const prompt = `
You are a Lead Macroeconomic & Geopolitical Risk Analyst monitoring emerging supply chain vulnerabilities for PT Fertilizer Indo (major agricultural chemical and fertilizer corporation in Indonesia).

Scan the current global risk landscape, taking into special account:
1. Natural Geohazards & Ring of Fire Activity (e.g., active volcanoes across Indonesia like Mount Lewotobi Laki-laki, Mount Marapi, Mount Ruang, ash clouds causing aviation and coastal vessel diversions, sulfur/acid feedstock supply).
2. Geopolitical Chokepoints (Strait of Hormuz, Red Sea & Bab el-Mandeb, Russia-Ukraine Black Sea corridors, Taiwan Strait).
3. Energy & Natural Gas Feedstocks (Henry Hub, TTF, Asian LNG spot prices, refining margins, fuel shortages).
4. Global Fertilizer Market & Trade Restrictions (China urea export restrictions, Moroccan phosphate rock, Canadian potash port/rail strikes, Egyptian fertilizer plant gas supply).
5. Macro & Currency Pressures (USD/IDR volatility, Bank Indonesia rate policy vs Federal Reserve, import inflation).

Generate 5 distinct topic groups with active trending topics. Respond with STRICT VALID JSON following this schema:
{
  "scannedAt": "${new Date().toISOString()}",
  "totalTrendingCount": 20,
  "summary": "Brief 1-sentence synthesis of current global macro & geological risk posture.",
  "groups": [
    {
      "group": "Category Name (e.g. Geohazards & Volcanic Risks, Geopolitical Chokepoints, Energy & Gas Feedstocks, Fertilizer & Trade Wars, Macro & FX)",
      "urgency": "Critical" | "High" | "Moderate",
      "description": "Short explanation of why this category is trending now.",
      "topics": [
        {
          "name": "Topic Name (e.g. Mount Lewotobi Ash Disruption)",
          "status": "Trending" | "Escalating" | "Active",
          "relevance": "Why it matters to supply chains or commodities in 1 phrase",
          "searchQuery": "Search keyword phrase to query news feeds"
        }
      ]
    }
  ]
}
`;

    const result = await callGeminiWithFailover(prompt, geminiKeys);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Error in /api/ai/trending-topics:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
