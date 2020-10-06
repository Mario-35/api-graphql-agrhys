import request from "supertest";
import { app } from "../index";

import {
  areaTests,
  stationTests,
  sensorTests,
  datarawTests,
  dataupdateTests,
} from "./index";

describe("Graph API", () => {
  test("test version", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({ query: `{ version }` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.data.version).toEqual(
          `Inrae API version ${process.env.APP_VERSION} © mario.adam@inrae.fr`,
        );
        done();
      });
  });
});

describe("Table area", areaTests);
describe("Table station", stationTests);
describe("Table sensor", sensorTests);
describe("Table dataraw", datarawTests);
describe("Table dataupdate", dataupdateTests);
