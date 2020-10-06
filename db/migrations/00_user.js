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
  await db.schema.createTable("user", (table) => {
    table.increments('id').unsigned().notNullable().primary();
    table.string("username", 50).notNullable().unique();
    table.string("email", 100);
    table.boolean("email_verified").notNullable().defaultTo(false);
    table.string("name", 100);
    table.string("given_name", 100);
    table.string("family_name", 100);
    table.string("time_zone", 50);
    table.string("locale", 10);
    table.boolean("admin").notNullable().defaultTo(false);
    table.boolean("blocked").notNullable().defaultTo(false);
    table.boolean("archived").notNullable().defaultTo(false);
    table.timestamps(false, true);
    table.timestamp("last_login");
  });
};

module.exports.down = async (/** @type {Knex} */ db) => {
  await db.schema.dropTableIfExists("user");
};

module.exports.configuration = { transaction: true };
