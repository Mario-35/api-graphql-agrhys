/**
 * The custom GraphQL type that represents an Area.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
import { globalIdField } from "graphql-relay";
import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLString,
} from "graphql";

import { Area } from "../db";
import { nodeInterface } from "../node";
import { GraphQLDateTime } from "../fields";
import { Context } from "../context";

export const AreaType = new GraphQLObjectType<Area, Context>({
  name: "Area",
  interfaces: [nodeInterface],

  fields: {
    id: globalIdField(),

    code: {
      type: new GraphQLNonNull(GraphQLString),
    },

    name: {
      type: new GraphQLNonNull(GraphQLString),
    },

    active: {
      type: GraphQLBoolean,
    },
    createdAt: {
      type: GraphQLDateTime,
    },
    updatedAt: {
      type: GraphQLDateTime,
    },
  },
});
