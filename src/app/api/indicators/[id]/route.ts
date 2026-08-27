import { NextRequest, NextResponse } from 'next/server';
import { getIndicator } from '@/lib/data/indicators';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const indicator = getIndicator(id);

  if (!indicator) {
    return NextResponse.json(
      { error: `Indicator with id '${id}' not found` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    indicator,
  });
}
