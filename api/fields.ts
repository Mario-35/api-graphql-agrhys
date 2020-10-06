/**
 * Helper functions for creating GraphQL query fields
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

import moment from "moment";
import env from "./env";
import { QueryBuilder } from "knex";
import {
  GraphQLFieldConfig,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
  Kind,
} from "graphql";

import { Context } from "./context";

const MAX_INT = Number.MAX_SAFE_INTEGER;
const MIN_INT = Number.MIN_SAFE_INTEGER;

// import { Kind } from 'graphql/language';

const configDateField: GraphQLScalarTypeConfig<
  string | number | Date,
  string
> = {
  // export const dateField = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  parseValue(value: string | number | Date) {
    return new Date(value); // value from the client
  },
  serialize(value: string) {
    return moment(value).format(env.DATEFORMAT);
  },
  parseLiteral(ast) {
    return moment(ast.value).format(env.DATEFORMAT);
  },
};

const configBigIntField: GraphQLScalarTypeConfig<string | number, number> = {
  name: "BigInt",
  description:
    "The `BigInt` scalar type represents non-fractional signed whole numeric " +
    "values. BigInt can represent values between -(2^53) + 1 and 2^53 - 1. ",
  serialize: coerceBigInt,
  parseValue: coerceBigInt,
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      const num = parseInt(ast.value, 10);
      if (num <= MAX_INT && num >= MIN_INT) {
        return num;
      }
    }
    return null;
  },
};

function coerceBigInt(value: string) {
  if (value === "") {
    throw new TypeError(
      "BigInt cannot represent non 53-bit signed integer value: (empty string)",
    );
  }
  const num = Number(value);
  if (num !== num || num > MAX_INT || num < MIN_INT) {
    throw new TypeError(
      "BigInt cannot represent non 53-bit signed integer value: " +
        String(value),
    );
  }
  const int = Math.floor(num);
  if (int !== num) {
    throw new TypeError(
      "BigInt cannot represent non-integer value: " + String(value),
    );
  }
  return int;
}

export const countField: GraphQLFieldConfig<
  { query: QueryBuilder },
  Context
> = {
  type: new GraphQLNonNull(GraphQLInt),
  resolve(self) {
    return self.query.count().then((x: { count: number }[]) => x[0].count);
  },
};

export const GraphQLDateTime = new GraphQLScalarType(configDateField);
export const GraphQLBigInt = new GraphQLScalarType(configBigIntField);
