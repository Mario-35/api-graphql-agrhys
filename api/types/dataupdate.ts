/**
 * The custom GraphQL type that represents a sensor.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
import { globalIdField } from "graphql-relay";
import { GraphQLObjectType, GraphQLFloat } from "graphql";

import { Dataupdate } from "../db";
import { nodeInterface } from "../node";
import { GraphQLDateTime, GraphQLBigInt } from "../fields";
import { Context } from "../context";

export const DataupdateType = new GraphQLObjectType<Dataupdate, Context>({
  name: "Dataupdate",
  interfaces: [nodeInterface],

  fields: {
    id: globalIdField(),

    keyid: {
      type: GraphQLBigInt,
    },

    date: {
      type: GraphQLDateTime,
    },

    value: {
      type: GraphQLFloat,
    },

    validate: {
      type: GraphQLFloat,
    },
  },
});
