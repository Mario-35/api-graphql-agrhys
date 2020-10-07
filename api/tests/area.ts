import request from "supertest";
import { app } from "../index";
import db from "../db";

export const areaTests = (): void => {
  function makeStr(length: number) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  const code = makeStr(9);
  const name = makeStr(50);
  const newName = makeStr(50);

  test('[1]  Query area code = "TEST_AREA"', (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({ query: `{ area (code: "TEST_AREA") { code, name } }` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.data.area.code).toEqual("TEST_AREA");
        expect(res.body.data.area.name).toEqual("Zone de test");
        done();
      });
  });

  test('[2]  Query area code = "TEST_AREA", name = "Zone de test"', (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ area (code: "TEST_AREA", name: "Zone de test") { code, name } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.data.area.code).toEqual("TEST_AREA");
        expect(res.body.data.area.name).toEqual("Zone de test");
        done();
      });
  });

  test("[3]  Query area TEST_NULL not exist", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ area (code: "TEST_NULL") { code, name } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data.area).toBeNull();
        done();
      });
  });

  test("[4]  Query all areas", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ areas { code, name } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        db.count("id as CNT")
          .table("area")
          .where({ active: true })
          .then((count) => {
            expect(Number(res.body.data.areas.length)).toEqual(Number(count[0].CNT));
            done();
          });
      });
  });

  test("[5]  Query without code or name", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ area { code, name } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.data.area).toBeNull();
        done();
      });
  });

  test(`[6]  Mutation Add area (${code})`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `mutation { addArea (input: {code:"${code}", name:"${name}"}) { area { code, name } } } `,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data.addArea.area.code).toEqual(code);
        expect(res.body.data.addArea.area.name).toEqual(name);
        done();
      });
  });

  test(`[7]  Mutation Add same area (${code})`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `mutation { addArea (input: {code:"${code}", name:"${name}"}) { area { code,name } } } `,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data.addArea).toBeNull();
        expect(res.body.errors).toBeInstanceOf(Object);
        done();
      });
  });

  test(`[8]  Mutation Update area (${code} => ${newName})`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `mutation { updateArea (input: {code:"${code}", name:"${newName}"}) { area { code,name } } } `,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data.updateArea.area).toBeInstanceOf(Object);
        expect(res.body.data.updateArea.area.code).toEqual(code);
        expect(res.body.data.updateArea.area.name).toEqual(newName);
        done();
      });
  });
  test(`[9]  Mutation Delete area (${code})`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `mutation { deleteArea (input: {code:"${code}"}) { area { code,name } } } `,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data.deleteArea.area).toBeInstanceOf(Object);
        expect(res.body.data.deleteArea.area.code).toEqual(code);
        expect(res.body.data.deleteArea.area.name).toEqual(newName);
        done();
      });
  });

  test("[10] Mutation Delete area (none)", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `mutation { deleteArea (input: {code:"none"}) { area { code,name } } } `,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data.deleteArea).toBeInstanceOf(Object);
        expect(res.body.data.deleteArea.area).toBeNull();
        db.table("area")
          .delete()
          .where({ code: code })
          .then(() => {
            done();
          });
      });
  });
};
