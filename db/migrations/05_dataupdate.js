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
  await db.schema.createTable("dataupdate", (table) => {
    table.increments('id').unsigned().notNullable().primary();
    table.bigInteger('keyid').unsigned().notNullable();
    table.timestamp("date").notNullable();
    table.float('value').defaultTo(0).notNullable();
    table.boolean("validate").notNullable().defaultTo(false);
    table.string("import", 50);
    table.integer('tmp');
  });
};

module.exports.down = async (/** @type {Knex} */ db) => {
  await db.schema.dropTableIfExists("dataupdate");
};

module.exports.configuration = { transaction: true };
