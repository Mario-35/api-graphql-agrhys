/**
 * The top-level GraphQL API query fields related to sensors.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { GraphQLList, GraphQLString, GraphQLFieldConfig } from "graphql";

import { cursorToOffset } from "graphql-relay";

import db, { Dataupdate } from "../db";
import { Context } from "../context";
import { DataupdateType, customArgs } from "../types";
import { makeQueryRawSearchDate } from "../utils";
import { GraphQLBigInt } from "../fields";

export const dataupdate: GraphQLFieldConfig<Dataupdate, Context> = {
  type: DataupdateType,

  args: {
    keyid: { type: GraphQLBigInt },
  },

  async resolve(root, args, ctx) {
    if (!args.keyid) {
      ctx.customError("errors.NoKeyid", 503);
    }

    const query = db.table<Dataupdate>("dataupdate");

    if (args.keyid) {
      query.where(ctx.cleanArgs(args)).first();
      return await query;
    }

    return null;
  },
};

export const dataupdates: GraphQLFieldConfig<Dataupdate, Context> = {
  type: new GraphQLList(DataupdateType),

  args: {
    keyid: { type: GraphQLBigInt },
    start: { type: GraphQLString },
    end: { type: GraphQLString },
    day: { type: GraphQLString },
  },

  async resolve(root, args, ctx) {
    const query = db.table<Dataupdate>("dataupdate");
    // Only admins are allowed to fetch the list of users
    // ctx.ensureAuthorized((user) => user.admin);

    if (args.start || args.end || args.day) {
      query.whereRaw(makeQueryRawSearchDate(args));
      delete args.start;
      delete args.end;
      delete args.day;
    }

    if (args.first || args.after) {
      ctx.resultsInfos.limit = args.first === undefined ? 50 : args.first;
      ctx.resultsInfos.offset = args.after ? cursorToOffset(args.after) + 1 : 0;
      query
        .limit(Number(ctx.resultsInfos.limit))
        .offset(Number(ctx.resultsInfos.offset));

      delete args.first;
      delete args.after;
    }

    if (args.search) {
      query.whereRaw(args.search.trim());
    }

    query
      .where(ctx.cleanArgs(args))
      .whereNotNull("keyid")
      .orderBy("date", "asc")
      .then((res) => {
        ctx.resultsInfos.count = res.length;
      });

    return await query;
  },
};
