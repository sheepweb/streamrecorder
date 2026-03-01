async function up(knex) {
  const hasTable = await knex.schema.hasTable("sources");
  if (hasTable) {
    await knex.raw(
      `CREATE INDEX IF NOT EXISTS idx_sources_state ON sources(state)`,
    );
  }
}

async function down(knex) {
  await knex.raw(`DROP INDEX IF EXISTS idx_sources_state`);
}

module.exports = { up, down };
