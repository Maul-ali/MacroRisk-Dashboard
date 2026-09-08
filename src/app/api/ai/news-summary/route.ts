import { NextResponse } from 'next/server';
import { getNewsArticles } from '@/lib/data/indicators';

interface NewsSummaryRequest {
  mode?: 'digest' | 'single';
  language?: 'id' | 'en';
  articleId?: string;
  articleTitle?: string;
  articleText?: string;
}

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
              temperature: 0.2,
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
        console.warn(`Gemini key failed, attempting backup if available: ${lastError}`);
      }
    } catch (e: any) {
      lastError = e?.message || String(e);
      console.warn(`Gemini call error: ${lastError}`);
    }
  }
  throw new Error(`All Gemini API keys exhausted. Last error: ${lastError}`);
}

export async function POST(req: Request) {
  try {
    const body: NewsSummaryRequest = await req.json().catch(() => ({}));
    const mode = body.mode || 'digest';
    const language = body.language || 'id';

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

    if (mode === 'single') {
      const title = body.articleTitle || 'Untitled Article';
      const text = body.articleText || '';

      const prompt = `
You are a Senior Commodity Risk Intelligence Analyst for PT Fertilizer Indo (major Indonesian fertilizer producer).
Analyze the following news item and provide a high-precision summary.

Article Title: "${title}"
Article Content: "${text}"
Target Language: ${language === 'id' ? 'Bahasa Indonesia' : 'English'}

Provide STRICT VALID JSON in this schema:
{
  "title": "${title}",
  "takeaways": [
    "1-2 sentence core fact of what happened",
    "1-2 sentence direct transmission mechanism to commodities, shipping, or natural hazards",
    "1-2 sentence business implication for Indonesian agricultural/chemical industry"
  ],
  "riskLevel": "Low" | "Elevated" | "High" | "Critical",
  "affectedSectors": ["e.g. Logistics", "Natural Gas", "Urea", "Sulfur", "Maritime Shipping"],
  "actionableNote": "One direct operational suggestion for the risk management committee."
}
`;

      const result = await callGeminiWithFailover(prompt, geminiKeys);
      return NextResponse.json({ success: true, mode: 'single', data: result });
    }

    // Digest mode: synthesize top live news articles
    const liveArticles = await getNewsArticles();
    const articlesForPrompt = liveArticles.slice(0, 16).map((a) => ({
      title: a.title,
      source: a.source,
      region: a.region,
      tags: a.tags,
      summary: a.summary,
      publishedAt: a.publishedAt,
    }));

    const prompt = `
You are the Chief Intelligence Officer at PT Fertilizer Indo (Indonesian state-affiliated fertilizer and petrochemical producer).
Synthesize the following live global news radar (covering active volcanoes / Ring of Fire logistics disruptions, shipping chokepoints like Hormuz & Red Sea, energy feedstocks, currency, and fertilizer markets).

Target Language: ${language === 'id' ? 'Bahasa Indonesia' : 'English'}

LATEST MONITORED NEWS ARTICLES:
${JSON.stringify(articlesForPrompt, null, 2)}

Provide STRICT VALID JSON adhering to this exact schema:
{
  "headline": "A punchy, authoritative 1-sentence executive headline synthesizing current macro risk state",
  "executiveSummary": "2 cohesive, professional paragraphs outlining the macroeconomic, geopolitical, natural disaster (e.g. Indonesian volcanic activity & flight/cargo disruptions if present), and energy situation.",
  "keyRisks": [
    {
      "category": "Geohazards & Natural Events" | "Geopolitics & Chokepoints" | "Energy & Feedstocks" | "FX & Trade Policy",
      "severity": "Critical" | "High" | "Elevated",
      "summary": "1-2 sentence description of the threat and how it impacts regional operations"
    }
  ],
  "commodityImpact": {
    "naturalGas": "Specific impact on gas feedstock pricing, LNG availability, or regional pipelines",
    "ureaAndAmmonia": "Impact on production margins, export bans, or global market supply",
    "sulfurAndPhosphate": "Impact on sulfur availability (including volcanic/refinery supply) and phosphate rock",
    "logisticsAndShipping": "Impact on maritime freight routes (Malacca, Red Sea, Hormuz, domestic Indonesian ports/airports)"
  },
  "recommendedActions": [
    "Prioritized operational action 1",
    "Prioritized operational action 2",
    "Prioritized operational action 3"
  ],
  "synthesizedAt": "${new Date().toISOString()}"
}
`;

    const result = await callGeminiWithFailover(prompt, geminiKeys);
    return NextResponse.json({
      success: true,
      mode: 'digest',
      language,
      articlesAnalyzed: articlesForPrompt.length,
      data: result,
    });
  } catch (err: any) {
    console.error('Error in /api/ai/news-summary:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
