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
    status: "error",
    input: args.filepath,
    LocalFile: `../csv/brutes.csv`,
    // 'localFileSave': `../api-agrhys/src/csv/upload-${Date.now().toString().replace(/\D/g, "")}.csv`,
    output: `../api-graphql-agrhys/csv/output.csv`,
  };
  const dateFile = moment().format("YYYYMMDDHHmmss");

  const csvFile = `temp${dateFile}`;
  const importFile = `import${dateFile}`;
  return new Promise((resolve, reject) => {
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
        db.schema
          .createTable(importFile, (table) => {
            table.increments("id").unsigned().notNullable().primary();
            table.integer("type").defaultTo(0);
            table.bigInteger("keyid").unsigned().notNullable();
            table.integer("station_id").defaultTo(0);
            table.integer("sensor_id").defaultTo(0);
            table.timestamp("date_record");
            table.float("valeur").defaultTo(0);
            table.string("info");
            table.string("import", 50);
          })
          .then(() => {
            db.transaction(async (tx: Knex.Transaction) => {
              function importDatas() {
                db.raw(
                  `INSERT INTO ${importFile} (keyid, type, sensor_id, date_record, valeur, info,import)` +
                    ` SELECT` +
                    ` CAST(concat(sensor.id, regexp_replace(to_char(TO_TIMESTAMP(REPLACE(${csvFile}.date_heure,'24:00:00','00:00:00'), 'DD/MM/YYYY HH24:MI:SS:MS'), 'YYYYMMDDHH24MI'), '\D','','g')) as bigint),` +
                    ` CASE substr(${csvFile}.info, 0, 2)` +
                    `   WHEN '#' THEN` +
                    `     2` +
                    `   WHEN '/' THEN` +
                    `     3` +
                    `   ELSE` +
                    `     1` +
                    ` END,` +
                    ` cast(sensor.id as int),` +
                    ` TO_TIMESTAMP(REPLACE(${csvFile}.date_heure,'24:00:00','00:00:00'), 'DD/MM/YYYY HH24:MI:SS:MS'),` +
                    ` CASE ${csvFile}.valeur` +
                    `   WHEN '---' THEN` +
                    `     NULL` +
                    `   ELSE` +
                    `     cast(REPLACE(valeur,',','.') as float)` +
                    ` END,` +
                    ` substr(${csvFile}.info, 0, 6),` +
                    ` concat(${csvFile}.station,';',${csvFile}.sensor,';',${csvFile}.date_heure,';',${csvFile}.valeur,';',${csvFile}.info)` +
                    ` FROM ${csvFile}` +
                    ` inner join sensor` +
                    ` on sensor.code = substr(${csvFile}.sensor,0,6);`,
                )
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .then((res: any) => {
                    results.nbLines = res["rowCount"];
                    db.raw(
                      `SELECT distinct sensor FROM ${csvFile} where sensor not in (select distinct code FROM sensor);`,
                    )
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      .then((res: any) => {
                        const enumerableSensor = [];
                        for (const key of Object.keys(res.rows)) {
                          enumerableSensor.push(res.rows[key].sensor);
                        }
                        results.noSensor = enumerableSensor;
                        db.raw(
                          `DELETE FROM ${importFile} AS i WHERE i.keyid = (SELECT keyid FROM dataraw AS d WHERE d.keyid = i.keyid AND d.value isnull AND i.valeur isNULL);`,
                        )
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          .then((res: any) => {
                            results.duplicateNull = res["rowCount"];
                            db.raw(
                              `DELETE FROM ${importFile} AS i WHERE i.keyid = (SELECT distinct keyid FROM dataraw AS d WHERE d.keyid = i.keyid and d.value = i.valeur) AND type=1;`,
                            )
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              .then((res: any) => {
                                results.duplicateData = res["rowCount"];
                                db.raw(
                                  `DELETE FROM ${importFile} AS i WHERE i.keyid in (SELECT keyid FROM dataupdate AS u WHERE u.keyid = i.keyid AND u.value = i.valeur) AND type=2;`,
                                )
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  .then((res: any) => {
                                    results.duplicateUpdate = res["rowCount"];
                                    db.raw(
                                      `INSERT INTO dataraw (keyid, sensor_id, date, value, import, tmp) SELECT keyid, sensor_id, date_record, valeur, import, id FROM ${importFile} WHERE type=1 ON CONFLICT (keyid) DO NOTHING;`,
                                    )
                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                      .then((res: any) => {
                                        results.insertData = res["rowCount"];
                                        db.raw(
                                          `INSERT INTO dataupdate (keyid, date, value, import, tmp) SELECT keyid, date_record, valeur, import, id FROM ${importFile} AS i WHERE i.keyid in (select keyid from dataraw) AND i.type=2 ON CONFLICT DO NOTHING;`,
                                        )
                                          .then(() => {
                                            db.raw(
                                              `DELETE FROM ${importFile} AS i WHERE i.id in (SELECT distinct tmp FROM dataraw);`,
                                            ).then(() => {
                                              db.raw(
                                                `DELETE FROM ${importFile} AS i WHERE i.id in (SELECT distinct tmp FROM dataupdate);`,
                                              ).then(() => {
                                                db.schema.dropTableIfExists(csvFile).then(() => {
                                                  db.count("id as CNT")
                                                    .table(importFile)
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    .then((res: any) => {
                                                      results.stayInFile = Number(res[0].CNT);
                                                      results.status = "Ok";
                                                      done(results);
                                                    });
                                                });
                                              });
                                            });
                                          })
                                          .catch((error: unknown) => {
                                            ctx.addInfo("error", error);
                                            done();
                                          });
                                      })
                                      .catch((error: unknown) => {
                                        ctx.addInfo("error", error);
                                        done();
                                      });
                                  })
                                  .catch((error: unknown) => {
                                    ctx.addInfo("error", error);
                                    done();
                                  });
                              })
                              .catch((error: unknown) => {
                                ctx.addInfo("error", error);
                                done();
                              });
                          })
                          .catch((error: unknown) => {
                            ctx.addInfo("error", error);
                            done();
                          });
                      })
                      .catch((error: unknown) => {
                        ctx.addInfo("error", error);
                        done();
                      });
                  });
              }
              function done(res?: unknown) {
                if (res) {
                  results.status = "Ok";
                  tx.commit;
                  resolve(results);
                } else {
                  results.status = "Error";
                  // console.log(err);
                  tx.rollback;
                  reject(results);
                }
                tx.destroy().catch((err: unknown) => {
                  console.log(err);
                });
              }
              const client = await tx.client.acquireConnection();

              try {
                fs.statSync(results.LocalFile);
                const fileStream = fs.createReadStream(results.LocalFile);
                const stream = await client.query(
                  copyFrom.from(
                    `COPY ${csvFile} (station, sensor, date_heure, valeur, info) FROM STDIN WITH (FORMAT csv, DELIMITER ';')`,
                  ),
                );
                fileStream.on("error", done);
                fileStream.pipe(stream).on("finish", importDatas).on("error", done);
              } catch (e) {
                ctx.addInfo("importCsv.fileNotFound", results.LocalFile);
              }
            });
          })
          .catch((error: unknown) => {
            ctx.addInfo("error", error);
            return null;
          });
      })
      .catch((error: unknown) => {
        ctx.addInfo("error", error);
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
    await importCsv(input, ctx).then((res: any) => {
      for (const key in res) {
        ctx.addInfo(`importCsv.${key}`, res[key]);
      }
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
