import { NextRequest, NextResponse } from 'next/server';
import { queryNeon, DbRiskParameter } from '@/lib/db/neonClient';

const VALID_STATUSES = [
  'Within Limit',
  'Within Appetite',
  'Within Tolerance',
  '> Tolerance',
  '> Trigger Level',
];

const VALID_TAXONOMIES = [
  'Strategic Risk',
  'Market and Macroeconomic Risk',
  'Financial Risk',
  'Credit/Counterparty Risk',
  'Operational Risk',
  'Investment/Project Risk',
  'Reputational Risk',
  'Regulatory, Legal & Compliance Risk',
];

export async function GET() {
  try {
    const parameters = await queryNeon<DbRiskParameter>(
      'SELECT * FROM risk_parameters ORDER BY id ASC;'
    );

    return NextResponse.json({
      success: true,
      count: parameters.length,
      data: parameters,
    });
  } catch (error) {
    console.error('Failed to fetch risk parameters from database:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve risk parameters from database' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const {
      id,
      name,
      taxonomy,
      status,
      currentValue,
      period,
      appetiteThreshold,
      toleranceThreshold,
      limitThreshold,
      triggerThreshold,
    } = body;

    // Required fields validation
    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json({ error: 'Field "id" is required and must be a non-empty string' }, { status: 400 });
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Field "name" is required and must be a non-empty string' }, { status: 400 });
    }
    if (!currentValue || typeof currentValue !== 'string' || !currentValue.trim()) {
      return NextResponse.json({ error: 'Field "currentValue" is required and must be a non-empty string' }, { status: 400 });
    }
    if (!period || typeof period !== 'string' || !period.trim()) {
      return NextResponse.json({ error: 'Field "period" is required and must be a non-empty string' }, { status: 400 });
    }

    // Enum validation
    if (!taxonomy || !VALID_TAXONOMIES.includes(taxonomy)) {
      return NextResponse.json(
        { error: `Invalid "taxonomy". Must be one of: ${VALID_TAXONOMIES.join(', ')}` },
        { status: 400 }
      );
    }
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid "status". Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if ID already exists
    const existing = await queryNeon<DbRiskParameter>(
      'SELECT id FROM risk_parameters WHERE id = $1 LIMIT 1;',
      [id.trim()]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: `A risk parameter with ID "${id.trim()}" already exists.` },
        { status: 409 }
      );
    }

    // Insert new row
    const inserted = await queryNeon<DbRiskParameter>(
      `INSERT INTO risk_parameters (
        id, name, taxonomy, status, current_value, period,
        appetite_threshold, tolerance_threshold, limit_threshold, trigger_threshold,
        updated_at
      ) VALUES (
        $1, $2, $3::risk_taxonomy, $4::risk_status, $5, $6, $7, $8, $9, $10, NOW()
      ) RETURNING *;`,
      [
        id.trim(),
        name.trim(),
        taxonomy,
        status,
        currentValue.trim(),
        period.trim(),
        appetiteThreshold || null,
        toleranceThreshold || null,
        limitThreshold || null,
        triggerThreshold || null,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Risk parameter created successfully',
        data: inserted[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create risk parameter:', error);
    return NextResponse.json(
      { error: 'Internal server error while creating risk parameter' },
      { status: 500 }
    );
  }
}
