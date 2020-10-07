/**
 * GraphQL API mutations related to areas.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import db, { Sensor } from "../db";
import { SensorType } from "../types";
import { Context } from "../context";
import { validate, searchStationId } from "../utils";
import { mutationWithClientMutationId } from "graphql-relay";
import { GraphQLNonNull, GraphQLString, GraphQLList, GraphQLInt } from "graphql";

const inputFields = {
  station_id: { type: GraphQLInt },
  station_code: { type: GraphQLString },
  station_name: { type: GraphQLString },
  code: { type: GraphQLString },
  name: { type: GraphQLString },
  unite: { type: GraphQLString },
  list: { type: GraphQLString },
  file: { type: GraphQLString },
};

function validateInput(
  input: typeof inputFields,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): { data: Record<string, any>; errors: [string, string][] } {
  const { data, errors } = validate(input, (x) =>
    x

      .field("code", { trim: true })
      .isRequired()

      .field("name", { trim: true })
      .isRequired()
      .isLength({ min: 2, max: 80 })

      .field("unite", { trim: true }),
  );
  return { data, errors };
}

export const addSensor = mutationWithClientMutationId({
  name: "addSensor",
  description: "add a Sensor.",

  inputFields,

  outputFields: {
    sensor: {
      type: SensorType,
      resolve: (payload) => payload.sensor,
    },

    errors: {
      type: new GraphQLList(new GraphQLNonNull(new GraphQLList(GraphQLString))),
    },
  },

  // eslint-disable-next-line
  async mutateAndGetPayload(input, ctx: Context) {
    const { data, errors } = validateInput(input);

    if (errors.length > 0) {
      return { errors };
    }

    const searchId = searchStationId({ ...input, ...data });

    if (!searchId) {
      ctx.customError("errors.NoStation", 501);
    }

    const stationId = await db
      .table("station")
      .where({ ...searchId })
      .select("id")
      .first();

    if (!stationId || !stationId.id) {
      return { station: null };
    }

    let sensor;

    if (Object.keys(data).length) {
      [sensor] = await db
        .table<Sensor>("sensor")
        .insert({
          station_id: Number(stationId.id),
          ...data,
        })
        .returning("*");
    }

    return { sensor };
  },
});

export const updateSensor = mutationWithClientMutationId({
  name: "updateSensor",
  description: "update a Sensor.",

  inputFields,

  outputFields: {
    sensor: {
      type: SensorType,
      resolve: (payload) => payload.sensor,
    },

    errors: {
      type: new GraphQLList(new GraphQLNonNull(new GraphQLList(GraphQLString))),
    },
  },

  // eslint-disable-next-line
  async mutateAndGetPayload(input, ctx: Context) {
    const { data, errors } = validateInput(input);

    if (errors.length > 0) {
      return { errors };
    }

    let sensor;

    if (Object.keys(data).length) {
      [sensor] = await db.table<Sensor>("sensor").where({ code: data.code }).update(data).returning("*");
    }

    return { sensor };
  },
});

export const deleteSensor = mutationWithClientMutationId({
  name: "deleteSensor",
  description: "delete a Sensor.",
  // in fact deactivate

  inputFields,

  outputFields: {
    sensor: {
      type: SensorType,
      resolve: (payload) => payload.sensor,
    },

    errors: {
      type: new GraphQLList(new GraphQLNonNull(new GraphQLList(GraphQLString))),
    },
  },

  // eslint-disable-next-line
  async mutateAndGetPayload(input, ctx: Context) {
    const { data, errors } = validate(input, (x) => x.field("code", { trim: true }).isRequired());

    if (errors.length > 0) {
      return { errors };
    }

    let sensor;

    if (Object.keys(data).length) {
      [sensor] = await db
        .table<Sensor>("sensor")
        .where({ code: data.code })
        .update({ active: false })
        .returning("*");
    }

    return { sensor };
  },
});
