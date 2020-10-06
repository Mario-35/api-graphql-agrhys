/**
 * The top-level GraphQL API query fields related to areas.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import {
  GraphQLList,
  GraphQLString,
  GraphQLFieldConfig,
  GraphQLBoolean,
} from "graphql";

import { cursorToOffset } from "graphql-relay";

import db, { Area } from "../db";
import { Context } from "../context";
import { AreaType, customArgs } from "../types";
// import { countField } from "../fields";

export const area: GraphQLFieldConfig<Area, Context> = {
  type: AreaType,

  args: {
    code: { type: GraphQLString },
    name: { type: GraphQLString },
    search: { type: GraphQLString },
    format: { type: GraphQLString },
  },

  async resolve(root, args, ctx) {
    const query = db.table<Area>("area");

    if (args.code || args.name) {
      query.where(ctx.cleanArgs(args)).where({ active: true }).first();
      return await query;
    }
    return null;
  },
};

export const areas: GraphQLFieldConfig<Area, Context> = {
  type: new GraphQLList(AreaType),

  args: {
    ...{
      code: { type: GraphQLString },
      name: { type: GraphQLString },
      count: { type: GraphQLBoolean },
    },
    ...customArgs,
  },

  async resolve(root, args, ctx) {
    // Only admins are allowed to fetch the list of users
    // ctx.ensureAuthorized((user) => user.admin);

    const query = db.table<Area>("area");

    const limit = args.first === undefined ? 50 : args.first;
    const offset = args.after ? cursorToOffset(args.after) + 1 : 0;

    query
      .where(ctx.cleanArgs(args))
      .where({ active: true })
      .limit(limit)
      .offset(offset)
      .orderBy("created_at", "desc")
      .select();

    return await query;
  },
};
