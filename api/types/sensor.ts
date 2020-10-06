/**
 * The custom GraphQL type that represents a sensor.
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

import { Sensor } from "../db";
import { nodeInterface } from "../node";
import { GraphQLDateTime } from "../fields";
import { Context } from "../context";
import { StationType } from "./station";

export const SensorType = new GraphQLObjectType<Sensor, Context>({
  name: "Sensor",
  interfaces: [nodeInterface],

  fields: {
    id: globalIdField(),

    station: {
      type: StationType,
      resolve(self, args, ctx) {
        return ctx.stationById.load(self.station_id);
      },
    },

    code: {
      type: new GraphQLNonNull(GraphQLString),
    },

    name: {
      type: new GraphQLNonNull(GraphQLString),
    },

    unite: {
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
