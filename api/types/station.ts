/**
 * The custom GraphQL type that represents a station.
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

import { Station } from "../db";
import { nodeInterface } from "../node";
import { GraphQLDateTime } from "../fields";
import { Context } from "../context";
import { AreaType } from "./area";

export const StationType = new GraphQLObjectType<Station, Context>({
  name: "Station",
  interfaces: [nodeInterface],

  fields: {
    id: globalIdField(),

    area: {
      type: AreaType,
      resolve(self, args, ctx) {
        return ctx.areaById.load(self.area_id);
      },
    },

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
