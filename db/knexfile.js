/**
 * Knex.js CLI configuration.
 *
 * @see https://knexjs.org/#knexfile
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
const fs = require("fs");

// Load environment variables (PGHOST, PGUSER, etc.)
require("env");

/**
 * @type {import("knex").Config}
 */
module.exports = {
  client: "pg",

  connection: {
    ssl: process.env.PGSSLMODE === "verify-ca" && {
      cert: fs.readFileSync(process.env.PGSSLCERT, "ascii"),
      key: fs.readFileSync(process.env.PGSSLKEY, "ascii"),
      ca: fs.readFileSync(process.env.PGSSLROOTCERT, "ascii"),
    },
  },

  pool: { min: 0, max: 1 },

  migrations: { tableName: "migrations" },

  // debug: true,
};
