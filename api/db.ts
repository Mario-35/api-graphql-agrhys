/**
 * Knex.js database client and query builder for PostgreSQL.
 *
 * @see https://knexjs.org/
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

import knex from "knex";
import env from "./env";

const db = knex({
  client: "pg",

  connection: {
    ssl:
      env.PGSSLMODE === "verify-ca" &&
      {
        // cert: fs.readFileSync(env.PGSSLCERT, "ascii"),
        // key: fs.readFileSync(env.PGSSLKEY, "ascii"),
        // ca: fs.readFileSync(env.PGSSLROOTCERT, "ascii"),
      },
  },

  // Note that the max connection pool size must be set to 1
  // in a serverless environment.
  pool: {
    min: env.APP_ENV === "production" ? 1 : 0,
    max: 1,
  },

  debug: env.PGDEBUG == "true",
  // debug: true,
});

export default db;

// The TypeScript definitions below are automatically generated.
// Do not touch them, or risk, your modifications being lost.

export type Area = {
  id: number; // integer
  code: string; // character varying
  name: string; // character varying
  active: boolean; // boolean
  created_at: Date; // timestamp with time zone
  updated_at: Date; // timestamp with time zone
};

export type Dataraw = {
  id: number; // integer
  keyid: string; // bigint
  sensor_id: number; // integer
  date: Date | null; // timestamp with time zone
  value: string | null; // real
  validate: string | null; // real
  active: boolean; // boolean
  import: string | null; // character varying
  tmp: number | null; // integer
  created_at: Date; // timestamp with time zone
  updated_at: Date; // timestamp with time zone
};

export type Dataupdate = {
  id: number; // integer
  keyid: string; // bigint
  date: Date; // timestamp with time zone
  value: string; // real
  validate: boolean; // boolean
  import: string | null; // character varying
  tmp: number | null; // integer
};

export type Sensor = {
  id: number; // integer
  station_id: number; // integer
  code: string; // character varying
  name: string; // character varying
  unite: string | null; // character varying
  active: boolean; // boolean
  created_at: Date; // timestamp with time zone
  updated_at: Date; // timestamp with time zone
};

export type Station = {
  id: number; // integer
  area_id: number; // integer
  code: string; // character varying
  name: string; // character varying
  active: boolean; // boolean
  created_at: Date; // timestamp with time zone
  updated_at: Date; // timestamp with time zone
};

export type User = {
  id: number; // integer
  username: string; // character varying
  email: string | null; // character varying
  email_verified: boolean; // boolean
  name: string | null; // character varying
  given_name: string | null; // character varying
  family_name: string | null; // character varying
  time_zone: string | null; // character varying
  locale: string | null; // character varying
  admin: boolean; // boolean
  blocked: boolean; // boolean
  archived: boolean; // boolean
  created_at: Date; // timestamp with time zone
  updated_at: Date; // timestamp with time zone
  last_login: Date | null; // timestamp with time zone
};
