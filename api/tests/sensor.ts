import request from "supertest";
import { app } from "../index";
import db from "../db";

export const sensorTests = (): void => {
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
  const testDatas: Array<{
    code: unknown;
    name: unknown;
    unite: unknown;
    newName: unknown;
    newUnite: unknown;
  }> = [
    {
      code: makeStr(9),
      name: makeStr(50),
      unite: makeStr(15),
      newName: makeStr(50),
      newUnite: makeStr(15),
    },
    {
      code: makeStr(9),
      name: makeStr(50),
      unite: makeStr(15),
      newName: makeStr(50),
      newUnite: makeStr(15),
    },
    {
      code: makeStr(9),
      name: makeStr(50),
      unite: makeStr(15),
      newName: makeStr(50),
      newUnite: makeStr(15),
    },
  ];
  test(`[1]  Query sensors (search : "code = '0102'")`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{sensors (search : "code = '0102'") { code, name }}`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data.sensors.length).toEqual(1);
        done();
      });
  });

  test(`[2]  Query sensor (code : "code = '0102'") and id is hide`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{sensor (code : "0102") { id, code, name }}`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data.sensor).toBeInstanceOf(Object);
        expect(Number(res.body.data.sensor.id)).not.toEqual(2);
        done();
      });
  });

  test("[3]  Query sensor search complex", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{sensors (search: "name LIKE '% Cours %' AND code LIKE '%010%'") { code, name, station {code,name} }}`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data.sensors).toBeInstanceOf(Object);
        expect(Number(res.body.data.sensors.length)).toEqual(2);
        expect(res.body.data.sensors[0].code).toEqual("0102");
        done();
      });
  });

  test("[4]  Query sensor station_code not exist", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({ query: `{sensors (station_code:"TEST_NULL") { code, name }}` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data.sensors).toBeNull();
        done();
      });
  });

  test("[5]  Query sensor without code or name", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ sensor { code, name } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data.sensor).toBeNull();
        done();
      });
  });

  test("[6]  Query all sensors", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ sensors { code, name } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        db.count("id as CNT")
          .table("sensor")
          .where({ active: true })
          .then((value) => {
            expect(Number(res.body.data.sensors.length)).toEqual(
              Number(value[0].CNT),
            );
            done();
          });
      });
  });

  test("[7]  Query all sensors with first parameter and extensions count", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ sensors (first:5)  { code, name } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(Number(res.body.data.sensors.length)).toEqual(5);
        expect(res.body.extensions).toBeInstanceOf(Object);
        expect(Number(res.body.extensions.count)).toEqual(5);
        done();
      });
  });

  test("[8]  Query all sensors with parameter station_id = 2", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ sensors (station_id:2) {code, name } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        db.count("id as CNT")
          .table("sensor")
          .where({ station_id: 2, active: true })
          .then((count) => {
            expect(Number(res.body.data.sensors.length)).toEqual(
              Number(count[0].CNT),
            );
            done();
          });
      });
  });

  test("[9]  Query sensors with parameter station_code = 'KODE2'", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ sensors (station_code:"KODE2") {code, name } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        db.count("id as CNT")
          .table("sensor")
          .where({ station_id: 2, active: true })
          .then((count) => {
            expect(Number(res.body.data.sensors.length)).toEqual(
              Number(count[0].CNT),
            );
            done();
          });
      });
  });

  test("[10] Query all sensors with parameter station_name = 'Test de pont'", (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ sensors (station_name:"Test de pont") {code, name } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        db.count("id as CNT")
          .table("sensor")
          .where({ station_id: 2, active: true })
          .then((count) => {
            expect(Number(res.body.data.sensors.length)).toEqual(
              Number(count[0].CNT),
            );
            done();
          });
      });
  });

  test(`[11] Mutation Add sensor with station_code = "KODE2" and without unité (${testDatas[0].code})`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `mutation { addSensor (input: {station_code:"KODE2", code:"${testDatas[0].code}", name:"${testDatas[0].name}"}) { sensor { code,name } } } `,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data.addSensor.sensor).toBeInstanceOf(Object);
        expect(res.body.data.addSensor.sensor.code).toEqual(testDatas[0].code);
        expect(res.body.data.addSensor.sensor.name).toEqual(testDatas[0].name);
        done();
      });
  });

  test(`[12] Mutation Add sensor with station_id = "2" with unité (${testDatas[1].code}, ${testDatas[1].newUnite})`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `mutation { addSensor (input: {station_id:2, code:"${testDatas[1].code}", name:"${testDatas[1].name}", unite:"${testDatas[1].unite}"}) { sensor { code, name, unite } } } `,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data.addSensor.sensor).toBeInstanceOf(Object);
        expect(res.body.data.addSensor.sensor.code).toEqual(testDatas[1].code);
        expect(res.body.data.addSensor.sensor.name).toEqual(testDatas[1].name);
        expect(res.body.data.addSensor.sensor.unite).toEqual(
          testDatas[1].unite,
        );
        done();
      });
  });

  test(`[13] Mutation Update sensor (${testDatas[0].code} => ${testDatas[0].newName}, ${testDatas[0].newUnite})`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `mutation { updateSensor (input: {code:"${testDatas[0].code}", name:"${testDatas[0].newName}", unite:"${testDatas[0].newUnite}"}) { sensor { code, name, unite } } } `,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data.updateSensor.sensor).toBeInstanceOf(Object);
        expect(res.body.data.updateSensor.sensor.code).toEqual(
          testDatas[0].code,
        );
        expect(res.body.data.updateSensor.sensor.name).toEqual(
          testDatas[0].newName,
        );
        expect(res.body.data.updateSensor.sensor.unite).toEqual(
          testDatas[0].newUnite,
        );
        done();
      });
  });

  test(`[14] Mutation Delete sensor (${testDatas[0].code})`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `mutation { deleteSensor (input: {code:"${testDatas[0].code}"}) { sensor { code,name } } } `,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data.deleteSensor.sensor).toBeInstanceOf(Object);
        expect(res.body.data.deleteSensor.sensor.code).toEqual(
          testDatas[0].code,
        );
        expect(res.body.data.deleteSensor.sensor.name).toEqual(
          testDatas[0].newName,
        );
        done();
      });
  });
};
