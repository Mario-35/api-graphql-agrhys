/**
 * The custom GraphQL type that represents a user account.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { globalIdField } from "graphql-relay";
import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean,
} from "graphql";

import { User } from "../db";
import { nodeInterface } from "../node";
import { GraphQLDateTime } from "../fields";
import { Context } from "../context";

export const UserType = new GraphQLObjectType<User, Context>({
  name: "User",
  interfaces: [nodeInterface],

  fields: {
    id: globalIdField(),

    username: {
      type: new GraphQLNonNull(GraphQLString),
    },

    email: {
      type: GraphQLString,
      resolve(self, args, ctx) {
        return ctx.user && (ctx.user.id === self.id || ctx.user.admin)
          ? self.email
          : null;
      },
    },

    emailVerified: {
      type: GraphQLBoolean,
      resolve(self, args, ctx) {
        return ctx.user && (ctx.user.id === self.id || ctx.user.admin)
          ? self.email_verified
          : null;
      },
    },

    name: {
      type: GraphQLString,
    },

    givenName: {
      type: GraphQLString,
      resolve(self) {
        return self.given_name;
      },
    },

    familyName: {
      type: GraphQLString,
      resolve(self) {
        return self.family_name;
      },
    },

    timeZone: {
      type: GraphQLString,
      resolve(self) {
        return self.time_zone;
      },
    },

    locale: {
      type: GraphQLString,
    },

    admin: {
      type: GraphQLBoolean,
    },

    blocked: {
      type: GraphQLBoolean,
    },

    createdAt: {
      type: GraphQLDateTime,
    },
    updatedAt: {
      type: GraphQLDateTime,
    },
    lastLogin: {
      type: GraphQLDateTime,
    },
  },
});
