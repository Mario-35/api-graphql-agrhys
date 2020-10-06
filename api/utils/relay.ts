/**
 * Relay.js global ID helper function(s).
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

import { fromGlobalId as parse } from "graphql-relay";

export function fromGlobalId(globalId: string, expectedType: string): string {
  const { id, type } = parse(globalId);

  if (expectedType && type !== expectedType) {
    throw new Error(
      `Expected an ID of type '${expectedType}' but got '${type}'.`,
    );
  }

  return id;
}
