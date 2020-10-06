import request from "supertest";
import db from "../db";
import { app } from "../index";

export const dataupdateTests = (): void => {
  test(`[1]  Query updates keyid = 1020220020012`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `query {dataupdates (keyid:1020220020012) {keyid, date, value}}`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data.dataupdates.length).toEqual(12);
        expect(res.body.data.dataupdates[0].keyid).toEqual(1020220020012);
        expect(Number(res.body.extensions.count)).toEqual(12);
        done();
      });
  });
};
