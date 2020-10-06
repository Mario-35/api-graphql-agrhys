/**
 * The custom GraphQL type that represents an Area.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
import { forwardConnectionArgs } from "graphql-relay";
import { GraphQLString } from "graphql";

export const customArgs = {
  search: { type: GraphQLString },
  format: { type: GraphQLString },
  ...forwardConnectionArgs,
};
