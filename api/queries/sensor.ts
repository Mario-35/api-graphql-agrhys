/**
 * The top-level GraphQL API query fields related to sensors.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import {
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFieldConfig,
} from "graphql";

import { cursorToOffset } from "graphql-relay";

import db, { Sensor } from "../db";
import { Context } from "../context";
import { SensorType, customArgs } from "../types";
import { searchStationId } from "../utils";
// import { countField } from "../fields";

export const sensor: GraphQLFieldConfig<Sensor, Context> = {
  type: SensorType,

  args: {
    code: { type: GraphQLString },
    name: { type: GraphQLString },
    unite: { type: GraphQLString },
    search: { type: GraphQLString },
  },

  async resolve(root, args, ctx) {
    const query = db.table<Sensor>("sensor");

    if (args.search) {
      query.whereRaw(args.search.trim());
    }

    if (args.code || args.name) {
      query.where(ctx.cleanArgs(args)).where({ active: true }).first();
      // console.log(query.toSQL());
      return await query;
    }

    return null;
  },
};

export const sensors: GraphQLFieldConfig<Sensor, Context> = {
  type: new GraphQLList(SensorType),

  args: {
    ...{
      code: { type: GraphQLString },
      name: { type: GraphQLString },
      station_id: { type: GraphQLInt },
      station_code: { type: GraphQLString },
      station_name: { type: GraphQLString },
    },
    ...customArgs,
  },

  async resolve(root, args, ctx) {
    const query = db.table<Sensor>("sensor");
    // Only admins are allowed to fetch the list of users
    // ctx.ensureAuthorized((user) => user.admin);

    if (
      "station_id" in args ||
      "station_code" in args ||
      "station_name" in args
    ) {
      const searchId = searchStationId(args);

      if (!searchId) {
        ctx.customError("errors.NoStation", 501);
      }

      const stationId = await db
        .table("station")
        .where({ ...searchId })
        .select("id")
        .first();

      if (!stationId || !stationId.id) {
        return null;
      }

      delete args.station_code;
      delete args.station_name;
      args.station_id = Number(stationId.id);
    }

    if ("first" in args || "after" in args) {
      ctx.resultsInfos.limit = args.first === undefined ? 50 : args.first;
      ctx.resultsInfos.offset = args.after ? cursorToOffset(args.after) + 1 : 0;
      delete args.first;
      delete args.after;
      query
        .limit(Number(ctx.resultsInfos.limit))
        .offset(Number(ctx.resultsInfos.offset));
    }

    if (args.search) {
      query.whereRaw(args.search.trim());
    }

    query
      .where(ctx.cleanArgs(args))
      .where({ active: true })
      .orderBy("created_at", "desc")
      .then((res) => {
        ctx.resultsInfos.count = res.length;
      });

    return await query;
  },
};
