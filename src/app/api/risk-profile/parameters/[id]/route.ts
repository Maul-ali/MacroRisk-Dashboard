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

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Parameter ID is required' }, { status: 400 });
    }

    const rows = await queryNeon<DbRiskParameter>(
      'SELECT * FROM risk_parameters WHERE id = $1 LIMIT 1;',
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: `Risk parameter with ID "${id}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('Failed to fetch risk parameter by id:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching risk parameter' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Parameter ID is required' }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    // Check if parameter exists
    const existing = await queryNeon<DbRiskParameter>(
      'SELECT * FROM risk_parameters WHERE id = $1 LIMIT 1;',
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: `Risk parameter with ID "${id}" not found` },
        { status: 404 }
      );
    }

    const current = existing[0];
    const name = body.name !== undefined ? body.name : current.name;
    const taxonomy = body.taxonomy !== undefined ? body.taxonomy : current.taxonomy;
    const status = body.status !== undefined ? body.status : current.status;
    const currentValue = body.currentValue !== undefined ? body.currentValue : current.currentValue;
    const period = body.period !== undefined ? body.period : current.period;
    const appetiteThreshold = body.appetiteThreshold !== undefined ? body.appetiteThreshold : current.appetiteThreshold;
    const toleranceThreshold = body.toleranceThreshold !== undefined ? body.toleranceThreshold : current.toleranceThreshold;
    const limitThreshold = body.limitThreshold !== undefined ? body.limitThreshold : current.limitThreshold;
    const triggerThreshold = body.triggerThreshold !== undefined ? body.triggerThreshold : current.triggerThreshold;

    if (body.taxonomy !== undefined && !VALID_TAXONOMIES.includes(taxonomy)) {
      return NextResponse.json(
        { error: `Invalid "taxonomy". Must be one of: ${VALID_TAXONOMIES.join(', ')}` },
        { status: 400 }
      );
    }
    if (body.status !== undefined && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid "status". Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await queryNeon<DbRiskParameter>(
      `UPDATE risk_parameters SET
        name = $1,
        taxonomy = $2::risk_taxonomy,
        status = $3::risk_status,
        current_value = $4,
        period = $5,
        appetite_threshold = $6,
        tolerance_threshold = $7,
        limit_threshold = $8,
        trigger_threshold = $9,
        updated_at = NOW()
      WHERE id = $10
      RETURNING *;`,
      [
        name,
        taxonomy,
        status,
        currentValue,
        period,
        appetiteThreshold || null,
        toleranceThreshold || null,
        limitThreshold || null,
        triggerThreshold || null,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Risk parameter updated successfully',
      data: updated[0],
    });
  } catch (error) {
    console.error('Failed to update risk parameter:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating risk parameter' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Parameter ID is required' }, { status: 400 });
    }

    const deleted = await queryNeon<DbRiskParameter>(
      'DELETE FROM risk_parameters WHERE id = $1 RETURNING *;',
      [id]
    );

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: `Risk parameter with ID "${id}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Risk parameter "${id}" deleted successfully`,
      data: deleted[0],
    });
  } catch (error) {
    console.error('Failed to delete risk parameter:', error);
    return NextResponse.json(
      { error: 'Internal server error while deleting risk parameter' },
      { status: 500 }
    );
  }
}
