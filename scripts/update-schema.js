/**
 * Generates `schema.graphql` file from the actual GraphQL schema.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

require("env");
require("@babel/register")({
  rootMode: "upward",
  extensions: [".ts", ".d.ts"],
  include: [],
});

const { updateSchema } = require("api/schema");

updateSchema((err) => {
  if (err) {
    console.err(err);
    process.exit(1);
  }
});
