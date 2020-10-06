/**
 * The Node interface for compatibility with Relay.js.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

/* eslint-disable @typescript-eslint/no-var-requires */

import { nodeDefinitions, fromGlobalId } from "graphql-relay";
import { assignType, getType } from "./utils";
import { Context } from "./context";

export const { nodeInterface, nodeField, nodesField } = nodeDefinitions(
  (globalId, context: Context) => {
    const { type, id } = fromGlobalId(globalId);
    switch (type) {
      case "Area":
        return context.areaById.load(Number(id)).then(assignType("Area"));
      case "Sensor":
        return context.sensorById.load(Number(id)).then(assignType("Sensor"));
      case "Station":
        return context.stationById.load(Number(id)).then(assignType("Station"));
      case "Dataraw":
        return context.datarawById.load(Number(id)).then(assignType("Dataraw"));
      case "Dataupdate":
        return context.dataUpdateById
          .load(Number(id))
          .then(assignType("Dataupdate"));
      case "User":
        return context.userById.load(Number(id)).then(assignType("User"));
      default:
        return null;
    }
  },
  (obj) => {
    switch (getType(obj)) {
      case "Area":
        return require("./types").AreaType;
      case "Sensor":
        return require("./types").SensorType;
      case "Station":
        return require("./types").StationType;
      case "Dataraw":
        return require("./types").DatarawType;
      case "Dataupdate":
        return require("./types").Dataupdate;
      case "User":
        return require("./types").UserType;
      default:
        return null;
    }
  },
);
