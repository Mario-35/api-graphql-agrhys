import request from "supertest";
import { app } from "../index";
import db from "../db";

export const stationTests = (): void => {
  function makeStr(length: number): string {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  // const testDatas: []{ [key: string]: unknown } = [
  const testDatas: Array<{ code: unknown; name: unknown; newName: unknown }> = [
    {
      code: makeStr(9),
      name: makeStr(50),
      newName: makeStr(50),
    },
    {
      code: makeStr(9),
      name: makeStr(50),
      newName: makeStr(50),
    },
    {
      code: makeStr(9),
      name: makeStr(50),
      newName: makeStr(50),
    },
  ];

  test(`[1]  Query station (search : "code = 'KODE2'")`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{stations (search : "code = 'KODE2'") { code, name }}`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toBeInstanceOf(Object);
        expect(Number(res.body.data.stations.length)).toEqual(1);
        done();
      });
  });

  test(`[2]  Query station (search : "code = 'KODE2'") and id is hide`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{station (code : "KODE2") { id, code, name }}`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data.station).toBeInstanceOf(Object);
        expect(Number(res.body.data.station.id)).not.toEqual(2);
        done();
      });
  });
  test("[3]  Query station search complex", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query:
          "{stations (search: \"name LIKE '% de %' AND code LIKE '%1%'\") { code, name, area {code, name} }}",
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data.stations).toBeInstanceOf(Object);
        expect(Number(res.body.data.stations.length)).toEqual(1);
        expect(res.body.data.stations[0].code).toEqual("KODE1");
        expect(res.body.data.stations[0].name).toEqual("Test de boa");
        done();
      });
  });
  test("[4]  Query station area_code not exist", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({ query: `{stations (area_code:"TEST_NULL") { code, name }}` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data.stations).toBeNull();
        done();
      });
  });

  test("[5]  Query station without code or name", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ station { code, name } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data.station).toBeNull();
        done();
      });
  });

  test("[6]  Query all stations", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ stations { code, name } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        db.count("id as CNT")
          .table("station")
          .where({ active: true })
          .then((value) => {
            expect(Number(res.body.data.stations.length)).toEqual(
              Number(value[0].CNT),
            );
            done();
          });
      });
  });

  test("[7]  Query all stations with first parameter and extensions count", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ stations (first:5)  { code, name } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(Number(res.body.data.stations.length)).toEqual(5);
        expect(res.body.extensions).toBeInstanceOf(Object);
        expect(Number(res.body.extensions.count)).toEqual(5);
        done();
      });
  });

  test("[8]  Query all stations with parameter area_id = 2", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ stations (area_id: 2) { code, name } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        db.count("area_id as CNT")
          .table("station")
          .where({ area_id: 2, active: true })
          .then((value) => {
            expect(Number(res.body.data.stations.length)).toEqual(
              Number(value[0].CNT),
            );
            done();
          });
      });
  });
  test("[9]  Query all stations with parameter area_code = 'TEST_DEUX'", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ stations (area_code:"TEST_DEUX") {code, name } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        db.count("id as CNT")
          .table("station")
          .where({ area_id: 2, active: true })
          .then((value) => {
            expect(Number(res.body.data.stations.length)).toEqual(
              Number(value[0].CNT),
            );
            done();
          });
      });
  });

  test("[10] Query all stations with parameter area_name = 'Zone deux'", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ stations (area_name:"Zone deux") {code, name } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        db.count("id as CNT")
          .table("station")
          .where({ area_id: 2, active: true })
          .then((value) => {
            expect(Number(res.body.data.stations.length)).toEqual(
              Number(value[0].CNT),
            );
            done();
          });
      });
  });
  test(`[11] Mutation Add station (${testDatas[0].code})`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `mutation { addStation (input: { area_id: 2, code: "${testDatas[0].code}", name: "${testDatas[0].name}" }) { station { code, name } } } `,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data.addStation.station).toBeInstanceOf(Object);
        expect(res.body.data.addStation.station.code).toEqual(
          testDatas[0].code,
        );
        expect(res.body.data.addStation.station.name).toEqual(
          testDatas[0].name,
        );
        done();
      });
  });

  test(`[12] Mutation Update station (${testDatas[0].code} => ${testDatas[0].newName})`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `mutation { updateStation (input: { code: "${testDatas[0].code}", name:"${testDatas[0].newName}" } ) { station { code, name } } } `,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data.updateStation.station).toBeInstanceOf(Object);
        expect(res.body.data.updateStation.station.code).toEqual(
          testDatas[0].code,
        );
        expect(res.body.data.updateStation.station.name).toEqual(
          testDatas[0].newName,
        );
        done();
      });
  });

  test(`[13] Mutation Delete station (${testDatas[0].code})`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `mutation { deleteStation (input: {code:"${testDatas[0].code}"}) { station { code,name } } } `,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data.deleteStation.station).toBeInstanceOf(Object);
        expect(res.body.data.deleteStation.station.code).toEqual(
          testDatas[0].code,
        );
        expect(res.body.data.deleteStation.station.name).toEqual(
          testDatas[0].newName,
        );
        db.table("station")
          .del()
          .whereIn("code", [
            testDatas[0].code,
            testDatas[1].code,
            testDatas[2].code,
          ])
          .then(() => {
            done();
          });
      });
  });
};
