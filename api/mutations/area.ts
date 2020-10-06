/**
 * GraphQL API mutations related to areas.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import db, { Area } from "../db";
import { AreaType } from "../types";
import { Context } from "../context";
import { validate } from "../utils";
import { mutationWithClientMutationId } from "graphql-relay";
import { GraphQLNonNull, GraphQLString, GraphQLList } from "graphql";

const inputFields = {
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

export const addArea = mutationWithClientMutationId({
  name: "addArea",
  description: "add an Area.",

  inputFields,

  outputFields: {
    area: {
      type: AreaType,
      resolve: (payload) => payload.area,
    },

    errors: {
      type: new GraphQLList(new GraphQLNonNull(new GraphQLList(GraphQLString))),
    },
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async mutateAndGetPayload(input, ctx: Context) {
    const { data, errors } = validateInput(input);

    if (errors.length > 0) {
      return { errors };
    }

    let area;

    if (Object.keys(data).length) {
      [area] = await db
        .table<Area>("area")
        .insert({ ...data })
        .returning("*");
    }

    return { area };
  },
});

export const updateArea = mutationWithClientMutationId({
  name: "updateArea",
  description: "update an Area.",
  // type: AreaType,

  inputFields,

  outputFields: {
    area: {
      type: AreaType,
      resolve: (payload) => payload.area,
    },

    errors: {
      type: new GraphQLList(new GraphQLNonNull(new GraphQLList(GraphQLString))),
    },
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async mutateAndGetPayload(input, ctx: Context) {
    const { data, errors } = validateInput(input);

    if (errors.length > 0) {
      return { errors };
    }

    let area;

    if (Object.keys(data).length) {
      [area] = await db.table<Area>("area").where({ code: data.code }).update(data).returning("*");
    }

    return { area };
  },
});

export const deleteArea = mutationWithClientMutationId({
  name: "deleteArea",
  description: "delete an Area.",
  // in fact deactivate

  inputFields,

  outputFields: {
    area: {
      type: AreaType,
      resolve: (payload) => payload.area,
    },

    errors: {
      type: new GraphQLList(new GraphQLNonNull(new GraphQLList(GraphQLString))),
    },
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    let area;

    if (Object.keys(data).length) {
      [area] = await db
        .table<Area>("area")
        .where({ code: data.code })
        .update({ active: false })
        .returning("*");
    }

    return { area };
  },
});
