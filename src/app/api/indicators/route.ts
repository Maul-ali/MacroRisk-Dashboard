import { NextResponse } from 'next/server';
import { getAllIndicators, getCompositeRiskScore, getSystemTrust, getMarketPulse } from '@/lib/data/indicators';

export async function GET() {
  const indicators = getAllIndicators();
  const riskScore = getCompositeRiskScore();
  const systemTrust = getSystemTrust();
  const marketPulse = getMarketPulse();

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    status: 'success',
    riskScore,
    systemTrust,
    marketPulse,
    indicators,
  });
}
