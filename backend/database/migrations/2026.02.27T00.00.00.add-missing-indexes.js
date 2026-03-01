async function up(knex) {
  const hasSources = await knex.schema.hasTable("sources");
  const hasVisitorViews = await knex.schema.hasTable("visitor_views");
  const hasFollowers = await knex.schema.hasTable("followers");
  const hasRecordings = await knex.schema.hasTable("recordings");

  if (hasSources) {
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_sources_path ON sources(path)`,
    );
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_sources_state_duration ON sources(state, duration)`,
    );
  }

  if (hasVisitorViews) {
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_visitor_views_fingerprint ON visitor_views(fingerprint)`,
    );
  }

  if (hasFollowers) {
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_followers_last_checked_at ON followers(last_checked_at)`,
    );
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_followers_pause ON followers(pause)`,
    );
  }

  if (hasRecordings) {
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_recordings_locale ON recordings(locale)`,
    );
  }
}

async function down(knex) {
  await knex.raw(`DROP INDEX IF EXISTS idx_sources_path`);
  await knex.raw(`DROP INDEX IF EXISTS idx_sources_state_duration`);
  await knex.raw(`DROP INDEX IF EXISTS idx_visitor_views_fingerprint`);
  await knex.raw(`DROP INDEX IF EXISTS idx_followers_last_checked_at`);
  await knex.raw(`DROP INDEX IF EXISTS idx_followers_pause`);
  await knex.raw(`DROP INDEX IF EXISTS idx_recordings_locale`);
}

module.exports = { up, down };
