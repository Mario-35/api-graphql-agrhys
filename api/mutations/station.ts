/**
 * GraphQL API mutations related to areas.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import db, { Station } from "../db";
import { StationType } from "../types";
import { Context } from "../context";
import { validate, searchAreaId } from "../utils";
import { mutationWithClientMutationId } from "graphql-relay";
import { GraphQLNonNull, GraphQLString, GraphQLList, GraphQLInt } from "graphql";

const inputFields = {
  area_id: { type: GraphQLInt },
  area_code: { type: GraphQLString },
  area_name: { type: GraphQLString },
  code: { type: GraphQLString },
  name: { type: GraphQLString },
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
      .isLength({ min: 2, max: 80 }),
  );
  return { data, errors };
}

export const addStation = mutationWithClientMutationId({
  name: "addStation",
  description: "add a Station.",
  // type: AreaType,

  inputFields,

  outputFields: {
    station: {
      type: StationType,
      resolve: (payload) => payload.station,
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

    const searchId = searchAreaId({ ...input, ...data });

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

    let station;

    if (Object.keys(data).length) {
      [station] = await db
        .table<Station>("station")
        .insert({
          area_id: Number(areaId.id),
          code: data.code as string,
          name: data.name as string,
        })
        .returning("*");
    }

    return { station };
  },
});

export const updateStation = mutationWithClientMutationId({
  name: "updateStation",
  description: "update a Station.",
  // type: AreaType,

  inputFields,

  outputFields: {
    station: {
      type: StationType,
      resolve: (payload) => payload.station,
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

    let station;

    if (Object.keys(data).length) {
      [station] = await db.table<Station>("station").where({ code: data.code }).update(data).returning("*");
    }

    return { station };
  },
});

export const deleteStation = mutationWithClientMutationId({
  name: "deleteStation",
  description: "delete an Area.",
  // in fact deactivate

  inputFields: {
    code: { type: GraphQLString },
    name: { type: GraphQLString },
  },

  outputFields: {
    station: {
      type: StationType,
      resolve: (payload) => payload.station,
    },

    errors: {
      type: new GraphQLList(new GraphQLNonNull(new GraphQLList(GraphQLString))),
    },
  },

  // eslint-disable-next-line
  async mutateAndGetPayload(input, ctx: Context) {
    const { data, errors } = validate(input, (x) =>
      x
        .field("code", { trim: true })
        .isRequired()

        .field("name", { trim: true })
        .isLength({ min: 2, max: 80 }),
    );

    if (errors.length > 0) {
      return { errors };
    }

    let station;

    if (Object.keys(data).length) {
      [station] = await db
        .table<Station>("station")
        .where({ code: data.code })
        .update({ active: false })
        .returning("*");
    }

    return { station };
  },
});
