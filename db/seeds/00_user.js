/**
 * Seeds the database with test / reference user accounts.
 *
 * @typedef {import("knex")} Knex
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

module.exports.seed = async (/** @type {Knex} */ db) => {
  await db.table("user").delete();
  await db.table("user").insert([
    {
      id: 1,
      username: "mario",
      email: "hello@mario.me",
      name: "Adam Mario",
      admin: true,
      created_at: "2019-10-02T03:19:49.877Z",
      updated_at: "2019-10-02T03:19:49.877Z",
      last_login: "2019-10-04T19:38:49.771Z",
    },
    {
      id: 2,
      username: "theodore",
      email: "theodore_roosvelt@gmail.com",
      name: "Theodore Roosvelt",
      created_at: "2019-07-21T21:44:59.136Z",
      updated_at: "2019-07-21T21:44:59.136Z",
      last_login: "2019-11-21T20:06:11.697Z",
    },
    {
      id: 3,
      username: "Rolland",
      email: "rolland.emmerich@yahoo.com",
      name: "Rolland Emmerich",
      created_at: "2020-04-24T06:32:10.353Z",
      updated_at: "2020-04-24T06:32:10.353Z",
      last_login: "2020-05-15T17:05:51.952Z",
    },
  ]);
};
