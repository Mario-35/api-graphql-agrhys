/**
 * The initial database schema.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 * @see https://knexjs.org/#Schema
 * @typedef {import("knex")} Knex
 */

module.exports.up = async (/** @type {Knex} */ db) /* prettier-ignore */ => {
  await db.schema.createTable("dataraw", (table) => {
    table.increments('id').unsigned().notNullable().primary();
    table.bigInteger('keyid').unsigned().notNullable().unique();
    table.integer('sensor_id').unsigned().notNullable().references("id").inTable("sensor").onDelete("CASCADE").onUpdate("CASCADE");
    table.timestamp("date");
    table.float('value').defaultTo(0);
    table.float('validate').defaultTo(0);
    table.boolean("active").notNullable().defaultTo(true);
    table.string("import", 50);
    table.integer('tmp');
    table.timestamps(false, true);
  });
};

module.exports.down = async (/** @type {Knex} */ db) => {
  await db.schema.dropTableIfExists("dataraw");
};

module.exports.configuration = { transaction: true };
