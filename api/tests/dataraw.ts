import request from "supertest";
import db from "../db";
import { app } from "../index";

const yearOne = Math.floor(Math.random() * 30) + 1950;
const yearTwo = Math.floor(Math.random() * 30) + 1950;

export const datarawTests = (): void => {
  test(`[1]  Query dataraw keyid = 1020220020012`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ dataraw (keyid:1020220020012) { keyid, date, value,validate }}`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data.dataraw.keyid).toEqual(1020220020012);
        done();
      });
  });

  test(`[2]  Query dataraw keyid = 1020220020012 and complete nested result`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ dataraw (keyid:1020220020012)  { keyid, date, value, validate, updates {keyid, date, value}, sensor {code, name, station {code, name, area {code, name}}} }}`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data.dataraw).toBeInstanceOf(Object);
        expect(res.body.data.dataraw.updates).toBeInstanceOf(Object);
        expect(res.body.data.dataraw.updates.length).toEqual(12);
        expect(res.body.data.dataraw.sensor).toBeInstanceOf(Object);
        expect(res.body.data.dataraw.sensor.station).toBeInstanceOf(Object);
        expect(res.body.data.dataraw.sensor.station.area).toBeInstanceOf(Object);
        expect(res.body.data.dataraw.keyid).toEqual(1020220020012);
        done();
      });
  });

  test(`[3]  Query dataraw with no keyid"`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ dataraw { keyid, date, value,validate }}`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data.dataraw).toBeNull();
        done();
      });
  });

  test(`[5]  Query dataraws data day = "02/02/2002"`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ dataraws (day: "02/02/2002") { keyid, date, value,validate }}`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data.dataraws.length).toEqual(2);
        expect(res.body.data.dataraws[0].keyid).toEqual(1020220020000);
        expect(res.body.data.dataraws[1].keyid).toEqual(1020220020012);
        expect(Number(res.body.extensions.count)).toEqual(2);
        done();
      });
  });

  test(`[6]  Query dataraws data day = "02/02/2002" and complete nested result`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ dataraws (day: "02/02/2002") { keyid, date, value, validate, sensor {code, name, station {code, name, area {code, name}}} }}`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data.dataraws).toBeInstanceOf(Object);
        expect(res.body.data.dataraws.length).toEqual(2);
        expect(res.body.data.dataraws[0].sensor).toBeInstanceOf(Object);
        expect(res.body.data.dataraws[0].sensor.station).toBeInstanceOf(Object);
        expect(res.body.data.dataraws[0].sensor.station.area).toBeInstanceOf(Object);
        expect(res.body.data.dataraws[0].keyid).toEqual(1020220020000);
        expect(res.body.data.dataraws[1].keyid).toEqual(1020220020012);
        expect(Number(res.body.extensions.count)).toEqual(2);
        done();
      });
  });

  test(`[7]  Query dataraws data start = "01/01/1998", end = "31/12/2002"`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ dataraws (start: "01/01/1998", end: "31/12/2002") { keyid, date, value,validate }}`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data.dataraws.length).toEqual(3);
        expect(res.body.data.dataraws[0].keyid).toEqual(1199804020000);
        expect(res.body.data.dataraws[1].keyid).toEqual(1020220020000);
        expect(res.body.data.dataraws[2].keyid).toEqual(1020220020012);
        expect(Number(res.body.extensions.count)).toEqual(3);
        done();
      });
  });
  test(`[8]  Query dataraws data start = "03/01/2020"`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ dataraws (start: "03/01/2020") { keyid, date, value,validate }}`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data.dataraws.length).toEqual(10);
        expect(Number(res.body.extensions.count)).toEqual(10);
        done();
      });
  });

  test(`[9]  Query dataraws data end = "10/01/2012"`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ dataraws (end: "10/01/2012") { keyid, date, value,validate }}`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        db.count("id as CNT")
          .table("dataraw")
          .whereRaw("date <= to_date('10/01/2012','DD/MM/YYYY')")
          .where({ active: true })
          .then((count) => {
            const value = Number(count[0].CNT);
            expect(res.body.data.dataraws.length).toEqual(value);
            expect(Number(res.body.extensions.count)).toEqual(value);
            done();
          });
      });
  });

  test(`[10] Query dataraw with no date"`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `{ dataraws { keyid, date, value,validate }}`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data.dataraws).toBeNull();
        done();
      });
  });
  test(`[11] Mutation add dataraw with date "30-09-${yearOne} 15:46:18""`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `mutation { addDataraw (input: {sensor_code:"0101", date:"30-09-${yearOne} 15:46:18", value :100}) { dataraw { sensor {code, name}, keyid, date, value, validate } } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data.addDataraw.dataraw.date).toContain(`${yearOne}-09-30T15:46:18`);
        expect(res.body.data.addDataraw.dataraw.keyid).toEqual(Number(`1${yearOne}09301546`));
        expect(res.body.data.addDataraw.dataraw.value).toEqual(100);

        done();
      });
  });

  test(`[12] Mutation add dataraw with date "30/09/${yearTwo} 15:46:18""`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `mutation { addDataraw (input: {sensor_code:"0101", date:"30-09-${yearTwo} 15:46:18", value :200}) { dataraw { sensor {code, name}, keyid, date, value, validate } } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        // expect(res.body.data.toBeInstanceOf(Object);
        expect(res.body.data.addDataraw.dataraw.date).toContain(`${yearTwo}-09-30T15:46:18`);
        expect(res.body.data.addDataraw.dataraw.keyid).toEqual(Number(`1${yearTwo}09301546`));
        expect(res.body.data.addDataraw.dataraw.value).toEqual(200);

        done();
      });
  });

  test(`[13] Mutation update dataraw with sensor_code:"0101", date "30/09/${yearOne} 15:46:18" and value 250`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `mutation { updateDataraw (input: {sensor_code:"0101", date:"30-09-${yearOne} 15:46:18", value :250})  { dataraw { updates {keyid, date, value}, sensor {code, name}, keyid, date, value, validate } } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        // expect(res.body.data.toBeInstanceOf(Object);
        expect(res.body.data.updateDataraw.dataraw.date).toContain(`${yearOne}-09-30T15:46:18`);
        expect(res.body.data.updateDataraw.dataraw.keyid).toEqual(Number(`1${yearOne}09301546`));
        expect(res.body.data.updateDataraw.dataraw.value).toEqual(100);
        expect(res.body.data.updateDataraw.dataraw.updates[0].keyid).toEqual(Number(`1${yearOne}09301546`));
        expect(res.body.data.updateDataraw.dataraw.updates[0].value).toEqual(250);

        done();
      });
  });

  test(`[14] Mutation update with same value`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `mutation { updateDataraw (input: {sensor_code:"0101", date:"30-09-${yearOne} 15:46:18", value :250})  { dataraw { updates {keyid, date, value}, sensor {code, name}, keyid, date, value, validate } } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data.updateDataraw.dataraw).toBeNull();
        expect(res.body.extensions.infoDB).not.toBeNull();
        done();
      });
  });

  test(`[15] Mutation update dataraw keyid 1${yearTwo}09301546 value 500 date`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `mutation { updateDataraw (input: {keyid:1${yearTwo}09301546, value :500}) { dataraw { updates {keyid, date, value}, sensor {code, name}, keyid, date, value, validate } } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        // expect(res.body.data.toBeInstanceOf(Object);
        expect(res.body.data.updateDataraw.dataraw.date).toContain(`${yearTwo}-09-30T15:46:18`);
        expect(res.body.data.updateDataraw.dataraw.keyid).toEqual(Number(`1${yearTwo}09301546`));
        expect(res.body.data.updateDataraw.dataraw.value).toEqual(200);
        expect(res.body.data.updateDataraw.dataraw.updates[0].keyid).toEqual(Number(`1${yearTwo}09301546`));
        expect(res.body.data.updateDataraw.dataraw.updates[0].value).toEqual(500);
        done();
      });
  });

  test(`[16] Mutation delete dataraw keyid 1${yearTwo}09301546`, (done) => {
    request(app)
      .post("/graphql")
      .type("form")
      .send({
        query: `mutation { deleteDataraw (input: {keyid:1${yearTwo}09301546}) { dataraw { sensor {code, name}, keyid, date, value, validate } } }`,
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.data).toBeInstanceOf(Object);
        // expect(res.body.data.toBeInstanceOf(Object);
        expect(res.body.data.deleteDataraw.dataraw.date).toContain(`${yearTwo}-09-30T15:46:18`);
        expect(res.body.data.deleteDataraw.dataraw.keyid).toEqual(Number(`1${yearTwo}09301546`));

        db.table("dataupdate")
          .whereIn("keyid", [Number(`1${yearOne}09301546`), Number(`1${yearTwo}09301546`)])
          .delete()
          .then(() => {
            db.table("dataraw")
              .whereIn("keyid", [Number(`1${yearOne}09301546`), Number(`1${yearTwo}09301546`)])
              .delete()
              .then(() => {
                done();
              });
          });
      });
  });
};
