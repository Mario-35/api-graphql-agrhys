/**
 * The top-level GraphQL API query fields return api version.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
import { GraphQLString } from "graphql";

export const version = {
  type: GraphQLString,
  resolve: (): string => `Inrae API version ${process.env.APP_VERSION} © mario.adam@inrae.fr`,
};
