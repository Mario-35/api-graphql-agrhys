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
  await db.schema.createTable("sensor", (table) => {
    table.increments('id').unsigned().notNullable().primary();
    table.integer('station_id').unsigned().notNullable().references("id").inTable("station").onDelete("CASCADE").onUpdate("CASCADE");
    table.string("code", 15).notNullable().unique();
    table.string("name", 50).notNullable();
    table.string("unite", 15);
    table.boolean("active").notNullable().defaultTo(true);
    table.timestamps(false, true);
  });
};

module.exports.down = async (/** @type {Knex} */ db) => {
  await db.schema.dropTableIfExists("sensor");
};

module.exports.configuration = { transaction: true };
