import { NextResponse } from 'next/server';
import { getAllIndicators, getCompositeRiskScore, getSystemTrust, getMarketPulse } from '@/lib/data/indicators';

export async function GET() {
  const [indicators, riskScore, systemTrust, marketPulse] = await Promise.all([
    getAllIndicators(),
    getCompositeRiskScore(),
    getSystemTrust(),
    getMarketPulse(),
  ]);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    status: 'success',
    riskScore,
    systemTrust,
    marketPulse,
    indicators,
  });
}
