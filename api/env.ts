/**
 * * Ensures that all of the environment dependencies are met.
 *
 * @see https://github.com/motdotla/dotenv
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

import * as dotenv from "dotenv";

if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: process.cwd() + "/env/.env.test" });
} else {
  console.log(
    "\x1b[32m%s\x1b[36m%s\x1b[33m%s\x1b[32m%s\x1b[0m",
    "==== ",
    "env : ",
    process.env.NODE_ENV,
    " ====",
  );
  console.log("\x1b[36m%s\x1b[33m%s\x1b[0m", "Host : ", process.env.PGHOST);
  console.log("\x1b[36m%s\x1b[33m%s\x1b[0m", "Database : ", process.env.PGDATABASE);
  console.log("\x1b[36m%s\x1b[33m%s\x1b[0m", "Schema : ", process.env.PGSCHEMA);
  console.log("\x1b[36m%s\x1b[33m%s\x1b[0m", "Port : ", process.env.PGPORT);
  console.log("\x1b[36m%s\x1b[33m%s\x1b[0m", "User : ", process.env.PGUSER);
  console.log("\x1b[36m%s\x1b[33m%s\x1b[0m", "Password : ", process.env.PGPASSWORD);
  console.log("\x1b[36m%s\x1b[33m%s\x1b[0m", "Listen port : ", process.env.PORT);
  console.log("\x1b[36m%s\x1b[33m%s\x1b[0m", "Graphiql : ", process.env.GRAPHIQL);
  console.log("\x1b[36m%s\x1b[33m%s\x1b[0m", "Debug : ", process.env.DEBUGSQL);
  console.log("\x1b[32m%s\x1b[0m", "============================");
}

export default process.env;
