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

  await db.schema.createTable("area", (table) => {
    table.increments('id').unsigned().notNullable().primary();
    table.string("code", 15).notNullable().unique();
    table.string("name", 50).notNullable();
    table.boolean("active").notNullable().defaultTo(true);
    table.timestamps(false, true);
  });

};

module.exports.down = async (/** @type {Knex} */ db) => {
  await db.schema.dropTableIfExists("station");
};

module.exports.configuration = { transaction: true };
