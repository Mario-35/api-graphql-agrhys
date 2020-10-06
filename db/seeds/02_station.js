/**
 * Seeds the database with test / reference user accounts.
 *
 * @typedef {import("knex")} Knex
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

module.exports.seed = async (/** @type {Knex} */ db) => {
  await db.table("station").delete();

  await db.table("station").insert([
    {
      area_id: 1,
      code: "KODE1",
      name: "Test de boa",
    },
    {
      area_id: 1,
      code: "KODE2",
      name: "Test de pont",
    },
    {
      area_id: 1,
      code: "KODE3",
      name: "Test o sterone",
    },
    {
      area_id: 1,
      code: "KODE4",
      name: "Test a rossa",
    },
    {
      area_id: 1,
      code: "KODE5",
      name: "test de gossesse",
    },

    {
      area_id: 1,
      code: "KODE6",
      name: "test imonial",
    },
    {
      area_id: 2,
      code: "KODE7",
      name: "test amant",
    },
    {
      area_id: 2,
      code: "KODE8",
      name: "test de resistance",
    },
    {
      area_id: 2,
      code: "KODE9",
      name: "test de test",
    },
  ]);
};
