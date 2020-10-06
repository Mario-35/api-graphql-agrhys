/**
 * GraphQL API Starter Kit for Node.js
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

import { graphqlHTTP } from "express-graphql";
import { express as voyager } from "graphql-voyager/middleware";
import express, { Router, Request, Response } from "express";

import env from "./env";
import { auth } from "./auth";
import { session } from "./session";
import i18n from "i18n";

i18n.configure({
  // setup some locales - other locales default to en silently
  locales: ["en", "fr", "de"],

  // sets a custom cookie name to parse locale settings from
  cookie: "yourcookiename",

  // where to store json files - defaults to './locales'
  directory: __dirname + "/locales",
  objectNotation: true,
});

// import { auth } from "./auth";
// import { session } from "./session";
import { schema } from "./schema";
import { Context } from "./context";

export const api = Router();
export const app = express();

api.use(session);
api.use(auth);

// Generates interactive UML diagram for the API schema
// https://github.com/APIs-guru/graphql-voyager
if (env.APP_ENV !== "production" && env.APP_ENV !== "test") {
  api.use("/graphql/model", voyager({ endpointUrl: "/graphql" }));
}

api.use(i18n.init);

const extensions = ({
  // document,
  // variables,
  // operationName,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Unreachable code error
  context,
}) => {
  return {
    runTime: Date.now() - context.startTime,
    ...context.resultsInfos,
  };
};

api.use(
  "/graphql",
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Unreachable code error
  graphqlHTTP((req) => {
    return {
      schema: schema,
      context: new Context(req as Request),
      graphiql: env.APP_ENV !== "production",
      pretty: !env.isProduction,
      customFormatErrorFn: (err) => {
        if (process.env.NODE_ENV !== "test") {
          console.error(err.originalError || err);
        }
        return err;
      },
      extensions,
    };
  }),
);

if (!env.isProduction) {
  // const app = express();

  app.use(api);
  app.get("/", (req: Request, res: Response) => {
    res.redirect("/graphql");
  });

  app.listen(env.PORT, () => {
    if (process.env.NODE_ENV !== "test") {
      console.log(`API listening on http://localhost:${env.PORT}/`);
    }
  });
}
