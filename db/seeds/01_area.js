/**
 * Seeds the database with test / reference user accounts.
 *
 * @typedef {import("knex")} Knex
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

module.exports.seed = async (/** @type {Knex} */ db) => {
  await db.table("area").delete();
  await db.table("area").insert([
    {
      id: 1,
      code: "TEST_AREA",
      name: "Zone de test",
    },
    {
      id: 2,
      code: "TEST_DEUX",
      name: "Zone deux",
    },
    {
      id: 3,
      code: "TEST_KILL",
      name: "Zone desactive",
      active: false,
    },
  ]);
};
