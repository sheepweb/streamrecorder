async function up(knex) {
  const hasFollowers = await knex.schema.hasTable("followers");
  const hasRecordingsFollowerLnk = await knex.schema.hasTable("recordings_follower_lnk");
  const hasFilesRelatedMph = await knex.schema.hasTable("files_related_mph");
  const hasRecordings = await knex.schema.hasTable("recordings");

  if (hasFollowers) {
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_followers_type ON followers(type)`,
    );
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_followers_country ON followers(country)`,
    );
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_followers_country_code ON followers(country_code)`,
    );
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_followers_language ON followers(language)`,
    );
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_followers_language_code ON followers(language_code)`,
    );
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_followers_gender ON followers(gender)`,
    );
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_followers_created_at ON followers(created_at)`,
    );
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_followers_document_id ON followers(document_id)`,
    );

    // For ILIKE searches
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_followers_username_lower ON followers(LOWER(username))`,
    );
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_followers_nickname_lower ON followers(LOWER(nickname))`,
    );
  }

  // Link tables (critical for JOINs)
  if (hasRecordingsFollowerLnk) {
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_recordings_follower_lnk_follower ON recordings_follower_lnk(follower_id)`,
    );
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_recordings_follower_lnk_recording ON recordings_follower_lnk(recording_id)`,
    );
  }

  // files_related_mph (for avatar lookups)
  if (hasFilesRelatedMph) {
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_files_related_mph_lookup ON files_related_mph(related_id, related_type, field)`,
    );
  }

  // recordings table
  if (hasRecordings) {
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_recordings_created_at ON recordings(created_at)`,
    );
  }
}

async function down(knex) {
  await knex.raw(`DROP INDEX IF EXISTS idx_followers_type`);
  await knex.raw(`DROP INDEX IF EXISTS idx_followers_country`);
  await knex.raw(`DROP INDEX IF EXISTS idx_followers_country_code`);
  await knex.raw(`DROP INDEX IF EXISTS idx_followers_language`);
  await knex.raw(`DROP INDEX IF EXISTS idx_followers_language_code`);
  await knex.raw(`DROP INDEX IF EXISTS idx_followers_gender`);
  await knex.raw(`DROP INDEX IF EXISTS idx_followers_created_at`);
  await knex.raw(`DROP INDEX IF EXISTS idx_followers_document_id`);
  await knex.raw(`DROP INDEX IF EXISTS idx_followers_username_lower`);
  await knex.raw(`DROP INDEX IF EXISTS idx_followers_nickname_lower`);
  await knex.raw(`DROP INDEX IF EXISTS idx_recordings_follower_lnk_follower`);
  await knex.raw(`DROP INDEX IF EXISTS idx_recordings_follower_lnk_recording`);
  await knex.raw(`DROP INDEX IF EXISTS idx_files_related_mph_lookup`);
  await knex.raw(`DROP INDEX IF EXISTS idx_recordings_created_at`);
}

module.exports = { up, down };
