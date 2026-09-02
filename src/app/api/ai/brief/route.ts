import { NextResponse } from 'next/server';
import { getCompositeRiskScore, getMarketPulse, getAllIndicators } from '@/lib/data/indicators';
import { RISK_PROFILE, getAttentionParameters } from '@/lib/data/riskProfileData';

interface GenerateBriefRequest {
  focus?: 'all' | 'energy' | 'fertilizer' | 'fx' | 'corporate';
  language?: 'id' | 'en';
  model?: 'gemini-3.6-flash' | 'deepseek-chat' | 'deepseek-reasoner';
}

function extractAndParseJSON(rawText: string) {
  try {
    // 1. Try direct parse
    return JSON.parse(rawText.trim());
  } catch {
    // 2. Try removing markdown code blocks
    const match = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        // continue
      }
    }

    // 3. Find first { and last }
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const jsonSub = rawText.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonSub);
    }

    throw new Error('Could not parse JSON from model output');
  }
}

export async function POST(req: Request) {
  try {
    const body: GenerateBriefRequest = await req.json().catch(() => ({}));
    const focus = body.focus || 'all';
    const language = body.language || 'id';
    const selectedModel = body.model || 'gemini-3.6-flash';

    const geminiKey = process.env.GEMINI_API_KEY;
    const deepseekKey = process.env.DEEPSEEK_API_KEY;

    // Gather Live Dashboard Context
    const compositeRisk = getCompositeRiskScore();
    const marketPulse = getMarketPulse();
    const attentionParams = getAttentionParameters().slice(0, 8);
    const allIndicators = getAllIndicators();

    // Format indicator summary
    const keyIndicators = allIndicators.map((ind) => ({
      name: ind.name,
      category: ind.category,
      current: ind.displayValue,
      unit: ind.unit,
      change1M: ind.change1M ? `${ind.change1M > 0 ? '+' : ''}${ind.change1M}%` : 'N/A',
      riskBand: ind.riskBand,
    }));

    const promptContext = {
      timestamp: new Date().toISOString(),
      macroRisk: {
        compositeScore: compositeRisk.score,
        riskLevel: compositeRisk.label,
        trend: compositeRisk.change > 0 ? `+${compositeRisk.change} pts (Rising)` : `${compositeRisk.change} pts (Falling)`,
        confidence: `${compositeRisk.confidence}% (${compositeRisk.confidenceLabel})`,
      },
      corporateRiskProfile: {
        score: `${RISK_PROFILE.score} ${RISK_PROFILE.scoreUnit}`,
        status: RISK_PROFILE.status,
        distribution: RISK_PROFILE.statusCounts,
        criticalParameters: attentionParams.map((p) => ({
          id: p.id,
          name: p.name,
          taxonomy: p.taxonomy,
          value: p.currentValue,
          status: p.status,
        })),
      },
      sampleIndicators: keyIndicators.slice(0, 10),
    };

    const systemInstructions = `
You are the Chief Risk Officer for PT Fertilizer Indo (major Indonesian fertilizer producer).
Synthesize current macro data and corporate risk profile into a sharp, C-level Executive Brief.

Focus Area: ${focus.toUpperCase()}
Language: ${language === 'id' ? 'Bahasa Indonesia' : 'English'}

Respond with STRICT VALID JSON ONLY adhering to this schema:
{
  "headline": "Sharp 1-line executive title summarizing current risk state",
  "riskRating": "${compositeRisk.label}",
  "executiveSummary": "2 concise paragraphs synthesizing cost pressures (gas/oil), fertilizer margins, and FX exposure.",
  "keyDrivers": [
    {
      "title": "Short driver title",
      "impact": "Critical",
      "detail": "Actionable explanation of cost transmission"
    },
    {
      "title": "Short driver title",
      "impact": "High",
      "detail": "Actionable explanation of cost transmission"
    }
  ],
  "criticalWatchpoints": [
    "Specific watchpoint 1",
    "Specific watchpoint 2",
    "Specific watchpoint 3"
  ],
  "strategicActions": [
    "Strategic recommendation 1",
    "Strategic recommendation 2",
    "Strategic recommendation 3"
  ],
  "corporateRiskNote": "Specific insight on the 43 corporate risk parameters (PPR-2 status, >Tolerance items like Phosphate rock inventory, LNG spot price, forex exposure)."
}
`;

    let briefResult: any = null;
    let usedModel = selectedModel;

    // ── 1. DeepSeek Provider ──
    if (selectedModel.startsWith('deepseek')) {
      if (deepseekKey) {
        try {
          const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${deepseekKey}`,
            },
            body: JSON.stringify({
              model: selectedModel,
              messages: [
                { role: 'system', content: systemInstructions },
                { role: 'user', content: `DATA SNAPSHOT:\n${JSON.stringify(promptContext, null, 2)}` },
              ],
              response_format: { type: 'json_object' },
              temperature: 0.3,
            }),
          });

          if (dsRes.ok) {
            const dsData = await dsRes.json();
            const content = dsData?.choices?.[0]?.message?.content;
            if (content) {
              briefResult = extractAndParseJSON(content);
            }
          } else {
            console.warn('DeepSeek request failed with status:', dsRes.status);
          }
        } catch (dsErr) {
          console.warn('DeepSeek fetch error, falling back to Gemini:', dsErr);
        }
      }
    }

    // ── 2. Gemini Provider (Primary or Fallback) ──
    if (!briefResult) {
      const geminiKeys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_BACKUP,
      ].filter((k): k is string => Boolean(k));

      if (geminiKeys.length === 0) {
        throw new Error('GEMINI_API_KEY is not configured in .env.local.');
      }
      usedModel = 'gemini-3.6-flash';

      let lastError: string = '';
      for (const key of geminiKeys) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `${systemInstructions}\n\nDATA SNAPSHOT:\n${JSON.stringify(
                          promptContext,
                          null,
                          2
                        )}`,
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 4096,
                  responseMimeType: 'application/json',
                },
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              briefResult = extractAndParseJSON(rawText);
              break;
            }
          } else {
            const errorText = await response.text();
            lastError = `Status ${response.status}: ${errorText}`;
            console.warn('Gemini key attempt failed, trying next key if available:', lastError);
          }
        } catch (fetchErr: any) {
          lastError = fetchErr.message;
          console.warn('Gemini fetch error, trying next key:', lastError);
        }
      }

      if (!briefResult) {
        throw new Error(`All Gemini API keys failed. Last error: ${lastError}`);
      }
    }

    return NextResponse.json({
      success: true,
      brief: briefResult,
      generatedAt: new Date().toISOString(),
      model: usedModel,
      focus,
      language,
    });
  } catch (error: unknown) {
    console.error('AI Brief Generation failed:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: 'Failed to generate AI brief', details: message },
      { status: 500 }
    );
  }
}
