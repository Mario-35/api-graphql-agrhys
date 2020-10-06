/**
 * The top-level GraphQL API query fields related to sensors.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { GraphQLList, GraphQLString, GraphQLFieldConfig } from "graphql";

import { cursorToOffset } from "graphql-relay";

import db, { Dataraw } from "../db";
import { Context } from "../context";
import { DatarawType, customArgs } from "../types";
import { makeQueryRawSearchDate } from "../utils";
import { GraphQLBigInt } from "../fields";

export const dataraw: GraphQLFieldConfig<Dataraw, Context> = {
  type: DatarawType,

  args: {
    keyid: { type: GraphQLBigInt },
  },

  async resolve(root, args, ctx) {
    if (!args.keyid) {
      ctx.customError("errors.NoKeyid", 503);
    }

    const query = db.table<Dataraw>("dataraw");

    if (args.keyid) {
      query.where(ctx.cleanArgs(args)).where({ active: true }).first();
      return await query;
    }

    return null;
  },
};

export const dataraws: GraphQLFieldConfig<Dataraw, Context> = {
  type: new GraphQLList(DatarawType),

  args: {
    ...{
      start: { type: GraphQLString },
      end: { type: GraphQLString },
      day: { type: GraphQLString },
    },
    ...customArgs,
  },

  async resolve(root, args, ctx) {
    const query = db.table<Dataraw>("dataraw");
    // Only admins are allowed to fetch the list of users
    // ctx.ensureAuthorized((user) => user.admin);

    if (args.start || args.end || args.day) {
      query.whereRaw(makeQueryRawSearchDate(args));
      delete args.start;
      delete args.end;
      delete args.day;
    } else {
      ctx.customError("errors.NoDate", 502);
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
      .where({ active: true })
      .whereNotNull("keyid")
      .orderBy("date", "asc")
      .then((res) => {
        ctx.resultsInfos.count = res.length;
      });

    return await query;
  },
};
