/**
 * Loads environment variables from .env files into `process.env`.
 *
 * @see https://github.com/motdotla/dotenv
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const minimist = require("minimist");

const args = minimist(process.argv.slice(2));
const env = args.env || minimist(args._).env || "dev";

dotenv.config({ path: path.resolve(__dirname, `.env.${env}.override`) });
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });
dotenv.config({ path: path.resolve(__dirname, `.env.override`) });
dotenv.config({ path: path.resolve(__dirname, `.env`) });

// Resolve relative paths to absolute
["PGSSLCERT", "PGSSLKEY", "PGSSLROOTCERT"].forEach((key) => {
  if (process.env[key] && process.env[key].startsWith(".")) {
    process.env[key] = path.resolve(__dirname, process.env[key]);
  }
});

// Ensure that the SSL key file has correct permissions
if (process.env.PGSSLKEY) {
  try {
    fs.chmodSync(process.env.PGSSLKEY, 0o600);
  } catch (err) {
    console.error(err);
  }
}
