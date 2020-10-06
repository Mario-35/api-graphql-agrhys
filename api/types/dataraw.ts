/**
 * The custom GraphQL type that represents a sensor.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
import { globalIdField } from "graphql-relay";
import { GraphQLObjectType, GraphQLFloat, GraphQLList } from "graphql";

import { Dataraw } from "../db";
import { nodeInterface } from "../node";
import { GraphQLDateTime, GraphQLBigInt } from "../fields";
import { Context } from "../context";
import { SensorType } from "./sensor";
import { DataupdateType } from "./dataupdate";

export const DatarawType = new GraphQLObjectType<Dataraw, Context>({
  name: "Dataraw",
  interfaces: [nodeInterface],

  fields: {
    id: globalIdField(),

    sensor: {
      type: SensorType,
      resolve(self, args, ctx) {
        return ctx.sensorById.load(self.sensor_id);
      },
    },

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

    updates: {
      type: new GraphQLList(DataupdateType),
      resolve(self, args, ctx) {
        return ctx.dataUpdateByKeyId.load(self.keyid);
      },
    },

    createdAt: {
      type: GraphQLDateTime,
    },
    updatedAt: {
      type: GraphQLDateTime,
    },
  },
});
