/**
 * Seeds the database with test / reference user accounts.
 *
 * @typedef {import("knex")} Knex
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

module.exports.seed = async (/** @type {Knex} */ db) => {
  await db.table("dataupdate").delete();

  await db.table("dataupdate").insert([
    { keyid: 1020220020000, date: "2019-02-02 00:00:00", value: 1020, validate: false },
    { keyid: 1020220020012, date: "2020-01-01 00:12:00", value: 1025, validate: false },
    { keyid: 1020220020012, date: "2020-02-01 00:12:00", value: 1050, validate: false },
    { keyid: 1020220020012, date: "2020-03-01 00:12:00", value: 1100, validate: false },
    { keyid: 1020220020012, date: "2020-04-01 00:12:00", value: 1125, validate: false },
    { keyid: 1020220020012, date: "2020-05-01 00:12:00", value: 1225, validate: false },
    { keyid: 1020220020012, date: "2020-06-01 00:12:00", value: 1425, validate: false },
    { keyid: 1020220020012, date: "2020-07-01 00:12:00", value: 1725, validate: false },
    { keyid: 1020220020012, date: "2020-08-01 00:12:00", value: 2225, validate: false },
    { keyid: 1020220020012, date: "2020-09-01 00:12:00", value: 2425, validate: false },
    { keyid: 1020220020012, date: "2020-10-01 00:12:00", value: 2725, validate: false },
    { keyid: 1020220020012, date: "2020-11-01 00:12:00", value: 3225, validate: false },
    { keyid: 1020220020012, date: "2020-12-01 00:12:00", value: 6725, validate: false },
    { keyid: 1202001010030, date: "2020-01-31 12:30:00", value: 600, validate: true },
  ]);
};
