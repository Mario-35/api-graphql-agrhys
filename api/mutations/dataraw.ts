/**
 * GraphQL API mutations related to areas.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import db, { Dataraw, Dataupdate } from "../db";
import { DatarawType } from "../types";
import { Context } from "../context";
import { getSensorId } from "../utils";
import { mutationWithClientMutationId } from "graphql-relay";
import moment from "moment";

import {
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
} from "graphql";

import { GraphQLBigInt } from "../fields";

import fs from "fs";
import Knex from "knex";
import copyFrom from "pg-copy-streams";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const importCsv = function (args: { [key: string]: string }, ctx: Context) {
  const results: { [key: string]: unknown } = {
    importCsvStatus: "error",
    importCsvIntput: args.filepath,
    importCsvLocalFile: `../csv/essai.csv`,
    // 'localFileSave': `../api-agrhys/src/csv/upload-${Date.now().toString().replace(/\D/g, "")}.csv`,
    importCsvOutput: `../api-graphql-agrhys/csv/output.csv`,
  };
  const csvFile = `temp${moment().format("YYYYMMDDHHmmss")}`;
  return new Promise((resolve, reject) => {
    db.schema
      .dropTableIfExists(csvFile)
      .then(() => {
        results[`Drop ${csvFile}`] = "ok";
        db.schema
          .createTable(csvFile, (table) => {
            table.increments("id").unsigned().notNullable().primary();
            table.string("station");
            table.string("sensor");
            table.string("date_heure");
            table.string("valeur");
            table.string("info");
          })
          .then(() => {
            results[`create ${csvFile}`] = "ok";
            db.transaction(async (tx: Knex.Transaction) => {
              function importDatas() {
                db.schema.dropTableIfExists("importation").then(() => {
                  results["Drop importation"] = "ok";
                  db.schema
                    .createTable("dataraw", (table) => {
                      table.increments("id").unsigned().notNullable().primary();
                      table.integer("myType").defaultTo(0);
                      table.bigInteger("keyid").unsigned().notNullable().unique();
                      table.integer("station_id").defaultTo(0);
                      table.integer("sensor_id").defaultTo(0);
                      table.timestamp("date");
                      table.float("value").defaultTo(0);
                      table.string("info");
                    })
                    .then(() => {
                      console.log("---- create importation -----");
                      db.raw(
                        `INSERT INTO importation (keyid, myType, sensor_id, date_record, valeur, info)` +
                          ` SELECT` +
                          ` CAST(concat(sensor.id, regexp_replace(to_char(TO_TIMESTAMP(REPLACE(filecsv.date_heure,'24:00:00','00:00:00'), 'DD/MM/YYYY HH24:MI:SS:MS'), 'YYYYMMDDHH24MI'), '\D','','g')) as bigint),` +
                          ` CASE substr(filecsv.info, 0, 2)` +
                          `   WHEN '#' THEN` +
                          `     2` +
                          `   WHEN '/' THEN` +
                          `     3` +
                          `   ELSE` +
                          `     1` +
                          ` END,` +
                          ` cast(sensor.id as int),` +
                          ` TO_TIMESTAMP(REPLACE(filecsv.date_heure,'24:00:00','00:00:00'), 'DD/MM/YYYY HH24:MI:SS:MS'),` +
                          ` CASE filecsv.valeur` +
                          `   WHEN '---' THEN` +
                          `     NULL` +
                          `   ELSE` +
                          `     cast(REPLACE(valeur,',','.') as float)` +
                          ` END,` +
                          ` substr(filecsv.info, 0, 6)` +
                          ` FROM ${csvFile}` +
                          ` inner join sensor` +
                          ` on sensor.code = substr(filecsv.sensor,0,6);`,
                      )
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .then((res: any) => {
                          results.importCsvLines = res["rowCount"];
                          console.log(results);
                          db.raw(
                            `SELECT distinct station FROM filecsv where regexp_replace(station, '_._', '')  not in (select distinct code FROM station);`,
                          )
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            .then((res: any) => {
                              const enumerableStation = [];
                              for (const key of Object.keys(res.rows)) {
                                enumerableStation.push(res.rows[key].station);
                              }
                              results.importCsvNoStation = enumerableStation;
                              db.raw(
                                `DELETE FROM importation AS i WHERE i.keyid = (SELECT keyid FROM dataraw AS d WHERE d.keyid = i.keyid AND d.value isnull AND i.valeur isNULL);`,
                              )
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                .then((res: any) => {
                                  results.importCsvDuplicateNull = res["rowCount"];
                                  db.raw(
                                    `DELETE FROM importation AS i WHERE i.keyid = (SELECT distinct keyid FROM dataraw AS d WHERE d.keyid = i.keyid and d.value = i.valeur) AND myType=1;`,
                                  )
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    .then((res: any) => {
                                      results.importCsvDuplicateData = res["rowCount"];
                                      db.raw(
                                        `DELETE FROM importation AS i WHERE i.keyid in (SELECT keyid FROM dataupdate AS u WHERE u.keyid = i.keyid AND u.value = i.valeur) AND myType=2;`,
                                      )
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        .then((res: any) => {
                                          results.importCsvDuplicateCorrection = res["rowCount"];
                                          db.raw(
                                            `INSERT INTO dataraw (tmp, keyid, station_id, sensor_id, date_raw, value) SELECT id, keyid, station_id, sensor_id, date_record, valeur FROM importation WHERE myType=1 ON CONFLICT (keyid) DO NOTHING;`,
                                          )
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            .then((res: any) => {
                                              results.importCsvInsertData = res["rowCount"];
                                              db.raw(
                                                `INSERT INTO dataupdate (tmp, keyid, date, value) SELECT id, keyid, date_record, valeur FROM importation AS i WHERE i.keyid in (select keyid from data) AND i.myType=2 ON CONFLICT DO NOTHING;`,
                                              )
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                .then((res: any) => {
                                                  results.importCsvInsertCorrection = res["rowCount"];
                                                  db.raw(
                                                    `DELETE FROM importation AS i WHERE i.id in (SELECT distinct tmp FROM dataraw);`,
                                                  )
                                                    .then(() => {
                                                      db.raw(
                                                        `DELETE FROM importation AS i WHERE i.id in (SELECT distinct tmp FROM dataupdate);`,
                                                      )
                                                        .then(() => {
                                                          db.raw(`UPDATE dataraw SET tmp=0;`).then(() => {
                                                            db.raw(`UPDATE dataraw SET tmp=0;`).then(() => {
                                                              results.status = "Ok";
                                                              done(results);
                                                            });
                                                          });
                                                        })
                                                        .catch((error: unknown) => {
                                                          console.log(error);
                                                          done();
                                                        });
                                                    })
                                                    .catch((error: unknown) => {
                                                      console.log(error);
                                                      done();
                                                    });
                                                })
                                                .catch((error: unknown) => {
                                                  console.log(error);
                                                  done();
                                                });
                                            })
                                            .catch((error: unknown) => {
                                              console.log(error);
                                              done();
                                            });
                                        })
                                        .catch((error: unknown) => {
                                          console.log(error);
                                          done();
                                        });
                                    })
                                    .catch((error: unknown) => {
                                      console.log(error);
                                      done();
                                    });
                                })
                                .catch((error: unknown) => {
                                  console.log(error);
                                  done();
                                });
                            })
                            .catch((error: unknown) => {
                              console.log(error);
                              done();
                            });
                        })
                        .catch((error: unknown) => {
                          console.log(error);
                          done();
                        });
                    });
                });
              }
              function done(res?: unknown) {
                if (res) {
                  results.importCsvStatus = "Ok";
                  tx.commit;
                  resolve(results);
                } else {
                  results.importCsvStatus = "Error";
                  // console.log(err);
                  tx.rollback;
                  reject(results);
                }
                tx.destroy().catch((err: unknown) => {
                  console.log(err);
                });
              }
              console.log("---- ICI -----");
              const client = await tx.client.acquireConnection();
              console.log(results.importCsvLocalFile);
              // results["Filename"] = results.importCsvLocalFile;
              const fileStream = fs.createReadStream(results.importCsvLocalFile as string);
              const stream = client.query(
                copyFrom.from(
                  `COPY filecsv (station, sensor, date_heure, valeur, info) ` +
                    `FROM STDIN WITH (FORMAT csv, DELIMITER ';')`,
                ),
              );
              fileStream.on("error", done);
              fileStream.pipe(stream).on("finish", importDatas).on("error", done);
            });
          })
          .catch((error: unknown) => {
            console.log(error);
            return null;
          });
      })
      .catch((error: unknown) => {
        console.log(error);
        return null;
      });
  });
};

export const addDatarawFromFile = mutationWithClientMutationId({
  name: "addDatarawFromFile",
  description: "add datas in dataraw from file",

  inputFields: {
    filepath: { type: GraphQLString },
    filename: { type: GraphQLString },
  },

  outputFields: {
    dataraw: {
      type: DatarawType,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolve: (payload: any) => payload.dataraw,
    },

    errors: {
      type: new GraphQLList(new GraphQLNonNull(new GraphQLList(GraphQLString))),
    },
  },
  async mutateAndGetPayload(input: { [key: string]: string }, ctx: Context) {
    console.log("=========== addDatarawFromFile ===========");
    console.log(input);
    importCsv(input, ctx).then((res: unknown) => {
      console.log("=========== result ===========");
      console.log(res);
      return null;
    });
    return { dataraw: null };
  },
});

export const addDataraw = mutationWithClientMutationId({
  name: "addDataraw",
  description: "add a dataraw.",

  inputFields: {
    keyid: { type: GraphQLBigInt },
    sensor_id: { type: GraphQLInt },
    sensor_code: { type: GraphQLString },
    date: { type: GraphQLString },
    value: { type: GraphQLFloat },
    validate: { type: GraphQLFloat },
  },

  outputFields: {
    dataraw: {
      type: DatarawType,
      resolve: (payload) => payload.dataraw,
    },

    errors: {
      type: new GraphQLList(new GraphQLNonNull(new GraphQLList(GraphQLString))),
    },
  },

  async mutateAndGetPayload(input, ctx: Context) {
    input.sensor_id = await getSensorId({ ...input });

    if (input.sensor_id === 0) {
      ctx.customError("errors.NoSensor", 501);
    }

    input.keyid = ctx.makeKeyId(input.sensor_id, input.date);

    if (!input.keyid || input.keyid === 0) {
      return { dataraw: null };
    }

    let dataraw;

    input.date = ctx.makeKeyDate(input.date);

    if (Object.keys(input).length) {
      [dataraw] = await db
        .table<Dataraw>("dataraw")
        .insert({
          keyid: input.keyid,
          date: input.date,
          value: input.value ? input.value : null,
          validate: input.validate ? input.validate : null,
          sensor_id: input.sensor_id,
        })
        .returning("*");
    }

    return { dataraw };
  },
});

export const updateDataraw = mutationWithClientMutationId({
  name: "updateDataraw",
  description: "update a dataraw.",
  // type: AreaType,

  inputFields: {
    keyid: { type: GraphQLBigInt },
    sensor_id: { type: GraphQLInt },
    sensor_code: { type: GraphQLString },
    date: { type: GraphQLString },
    value: { type: GraphQLFloat },
    validate: { type: GraphQLFloat },
    active: { type: GraphQLBoolean },
  },

  outputFields: {
    dataraw: {
      type: DatarawType,
      resolve: (payload) => payload.dataraw,
    },

    errors: {
      type: new GraphQLList(new GraphQLNonNull(new GraphQLList(GraphQLString))),
    },
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async mutateAndGetPayload(input, ctx: Context) {
    if (!input.keyid) {
      input.sensor_id = await getSensorId({ ...input });

      if (input.sensor_id === 0) {
        ctx.customError("errors.NoSensor", 501);
      }
      input.keyid = ctx.makeKeyId(input.sensor_id, input.date);
    }

    if (!input.keyid || input.keyid === 0) {
      return { dataraw: null };
    }
    let dataraw;

    if (Object.keys(input).length) {
      const isInUpdates = await db
        .table<Dataupdate>("dataupdate")
        .count()
        .where({
          keyid: input.keyid,
          value: input.value ? input.value : null,
          validate: input.validate ? input.validate : false,
        })
        .then((res) => Number(res[0].count) > 0);

      if (isInUpdates) {
        ctx.addInfo("infoDB", "db.updateAlreadyIn");
        return { dataraw: null };
      }

      await db.table<Dataupdate>("dataupdate").insert({
        keyid: input.keyid,
        date: moment().toDate(),
        value: input.value ? input.value : null,
        validate: input.validate ? input.validate : false,
      });

      [dataraw] = await db
        .table<Dataraw>("dataraw")
        .where({ keyid: input.keyid })
        .where({ active: true })
        .returning("*");
    }

    return { dataraw };

    // updates {keyid, date, value}
  },
});

export const deleteDataraw = mutationWithClientMutationId({
  name: "deleteDataraw",
  description: "delete an dataraw.",
  // in fact deactivate

  inputFields: {
    keyid: { type: GraphQLBigInt },
    sensor_id: { type: GraphQLInt },
    sensor_code: { type: GraphQLString },
    date: { type: GraphQLString },
  },

  outputFields: {
    dataraw: {
      type: DatarawType,
      resolve: (payload) => payload.dataraw,
    },

    errors: {
      type: new GraphQLList(new GraphQLNonNull(new GraphQLList(GraphQLString))),
    },
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async mutateAndGetPayload(input, ctx: Context) {
    if (!input.keyid) {
      input.sensor_id = await getSensorId({ ...input });

      if (input.sensor_id === 0) {
        ctx.customError("errors.NoSensor", 501);
      }
      input.keyid = ctx.makeKeyId(input.sensor_id, input.date);
    }

    if (!input.keyid || input.keyid === 0) {
      return { dataraw: null };
    }

    let dataraw;

    if (input.keyid) {
      [dataraw] = await db
        .table<Dataraw>("dataraw")
        .where({ keyid: input.keyid })
        .update({ active: false })
        .returning("*");
    }

    return { dataraw };
  },
});
