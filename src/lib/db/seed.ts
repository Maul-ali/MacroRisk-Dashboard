import 'dotenv/config';
import { queryNeon } from './neonClient';
import { RISK_PROFILE } from '../data/riskProfileData';

async function seed() {
  console.log('🌱 Starting seed of 43 Risk Parameters into Neon Postgres...');

  let insertedCount = 0;
  for (const p of RISK_PROFILE.parameters) {
    const query = `
      INSERT INTO risk_parameters (
        id, name, taxonomy, status, current_value, period,
        appetite_threshold, tolerance_threshold, limit_threshold, trigger_threshold,
        updated_at
      ) VALUES (
        $1, $2, $3::risk_taxonomy, $4::risk_status, $5, $6, $7, $8, $9, $10, NOW()
      )
      ON CONFLICT (id) DO NOTHING
      RETURNING id;
    `;

    try {
      const res = await queryNeon(query, [
        p.id,
        p.name,
        p.taxonomy,
        p.status,
        p.currentValue,
        p.period,
        p.appetiteThreshold || null,
        p.toleranceThreshold || null,
        p.limitThreshold || null,
        p.triggerThreshold || null,
      ]);
      if (res.length > 0) insertedCount++;
    } catch (err) {
      console.error(`Error inserting ${p.id}:`, err);
    }
  }

  console.log(`✅ Seed completed! Processed ${RISK_PROFILE.parameters.length} parameters (${insertedCount} new inserts).`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
