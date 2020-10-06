/**
 * The top-level GraphQL API query fields related to user stations.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import {
  GraphQLList,
  GraphQLString,
  GraphQLFieldConfig,
  GraphQLInt,
} from "graphql";

import { cursorToOffset } from "graphql-relay";

import db, { Station } from "../db";
import { Context } from "../context";
import { searchAreaId } from "../utils";
import { StationType, customArgs } from "../types";
// import { countField } from "../fields";

export const station: GraphQLFieldConfig<Station, Context> = {
  type: StationType,

  args: {
    code: { type: GraphQLString },
    name: { type: GraphQLString },
    search: { type: GraphQLString },
  },

  async resolve(root, args, ctx) {
    const query = db.table<Station>("station");

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

export const stations: GraphQLFieldConfig<Station, Context> = {
  type: new GraphQLList(StationType),

  args: {
    ...{
      area_id: { type: GraphQLInt },
      area_code: { type: GraphQLString },
      area_name: { type: GraphQLString },
      code: { type: GraphQLString },
      name: { type: GraphQLString },
    },
    ...customArgs,
  },

  async resolve(root, args, ctx) {
    const query = db.table<Station>("station");
    // Only admins are allowed to fetch the list of users
    // ctx.ensureAuthorized((user) => user.admin);

    if ("area_id" in args || "area_code" in args || "area_name" in args) {
      const searchId = searchAreaId(args);

      if (!searchId) {
        ctx.customError("errors.NoArea", 501);
      }

      const areaId = await db
        .table("area")
        .where({ ...searchId })
        .select("id")
        .first();

      if (!areaId || !areaId.id) {
        return { station: null };
      }
      delete args.area_code;
      delete args.area_name;
      args.area_id = Number(areaId.id);
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
      .orderBy("created_at", "desc")
      .where({ active: true })
      .then((res) => {
        ctx.resultsInfos.count = res.length;
      });

    return await query;
  },
};
