/**
 * Jest configuration
 *
 * @see https://jestjs.io/docs/en/configuration
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 * @type {import("@jest/types").Config.InitialOptions}
 */

module.exports = {
  testPathIgnorePatterns: [
    "<rootDir>/*/dist/",
    "<rootDir>/*/scripts/",
    "<rootDir>/api/lib/",
  ],
};
