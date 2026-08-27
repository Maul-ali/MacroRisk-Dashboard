import { NextResponse } from 'next/server';
import { refreshAllData } from '@/lib/data/indicators';

export async function POST() {
  try {
    const updated = await refreshAllData();
    return NextResponse.json({
      status: 'success',
      message: 'Live market and macro data refreshed successfully across all active feeds',
      refreshedAt: new Date().toISOString(),
      systemTrust: updated.systemTrust,
      riskScore: updated.riskScore,
      seriesUpdated: updated.indicators.length,
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to refresh some feeds',
        error: String(err),
      },
      { status: 500 }
    );
  }
}
