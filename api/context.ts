/**
 * GraphQL API context variables.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

import DataLoader from "dataloader";
import { Request } from "express";

import db, { User, Area, Sensor, Station, Dataraw, Dataupdate } from "./db";
import { mapTo, mapToMany } from "./utils";
import { UnauthorizedError, ForbiddenError, createCustomError } from "./error";
import moment from "moment";
import i18n from "i18n";

export class Context {
  private readonly req: Request;
  startTime: number = Date.now();
  resultsInfos: { [key: string]: unknown } = {};

  constructor(req: Request) {
    this.req = req;

    i18n.setLocale("fr");

    // Add the currently logged in user object to the cache
    if (req.user) {
      this.userById.prime(req.user.id, req.user);
      this.userByUsername.prime(req.user.username, req.user);
    }
  }

  /*
   * Different Tools
   * ------------------------------------------------------------------------ */
  customError(keys: string, codeError: number): void {
    throw new createCustomError(i18n.__(keys), codeError);
  }

  // translate(keys: string, datas?: any): unknown {
  //   return this.req.__(keys, datas);
  // }

  addInfo(key: string, infos: string): void {
    this.resultsInfos[key] = i18n.__(infos);
    // this.resultsInfos.push(datas ? (keys, datas) : keys);
  }

  cleanArgs(args: { [key: string]: unknown }): { [key: string]: unknown } {
    delete args.format;
    delete args.search;
    return args;
  }

  // TODO ENV params
  makeKeyDate(date: Date | string): Date {
    const mydate = moment(date, "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
    return moment(mydate).toDate();
  }

  makeKeyId(sensorId: number | string, date: Date | string): number {
    const mydate = moment(date, "DD/MM/YYYY HH:mm:ss").format("YYYYMMDDHHmm");
    const dateTimeString = mydate.toString().match(/\d+/g);
    return dateTimeString ? Number(`${sensorId}${dateTimeString.join("").substr(0, 12)}`) : 0;
  }

  /*
   * Authentication and authorization
   * ------------------------------------------------------------------------ */

  get user(): User | null {
    return this.req.user;
  }

  signIn(user: User | null | undefined): Promise<User | null> {
    return this.req.signIn(user);
  }

  signOut(): void {
    this.req.signOut();
  }

  ensureAuthorized(check?: (user: User) => boolean): void {
    if (!this.req.user) {
      throw new UnauthorizedError();
    }

    if (check && !check(this.req.user)) {
      throw new ForbiddenError();
    }
  }

  /*
   * Data loaders
   * ------------------------------------------------------------------------ */

  stationById = new DataLoader<number, Station | null>((keys) =>
    db
      .table<Station>("station")
      .whereIn("id", keys)
      .select()
      .then((rows) =>
        rows.map((x) => {
          this.stationByCode.prime(x.code, x);
          return x;
        }),
      )
      .then((rows) => mapTo(rows, keys, (x) => x.id)),
  );

  stationByCode = new DataLoader<string, Station | null>((keys) =>
    db
      .table<Station>("station")
      .whereIn("code", keys)
      .select()
      .then((rows) =>
        rows.map((x) => {
          this.stationById.prime(x.id, x);
          return x;
        }),
      )
      .then((rows) => mapTo(rows, keys, (x) => x.code)),
  );

  sensorById = new DataLoader<number, Sensor | null>((keys) =>
    db
      .table<Sensor>("sensor")
      .whereIn("id", keys)
      .select()
      .then((rows) =>
        rows.map((x) => {
          this.sensorByCode.prime(x.code, x);
          return x;
        }),
      )
      .then((rows) => mapTo(rows, keys, (x) => x.id)),
  );

  sensorByCode = new DataLoader<string, Sensor | null>((keys) =>
    db
      .table<Sensor>("sensor")
      .whereIn("code", keys)
      .select()
      .then((rows) =>
        rows.map((x) => {
          this.sensorById.prime(x.id, x);
          return x;
        }),
      )
      .then((rows) => mapTo(rows, keys, (x) => x.code)),
  );

  areaById = new DataLoader<number, Area | null>((keys) =>
    db
      .table<Area>("area")
      .whereIn("id", keys)
      .select()
      .then((rows) =>
        rows.map((x) => {
          this.areaByCode.prime(x.code, x);
          return x;
        }),
      )
      .then((rows) => mapTo(rows, keys, (x) => x.id)),
  );

  areaByCode = new DataLoader<string, Area | null>((keys) =>
    db
      .table<Area>("area")
      .whereIn("code", keys)
      .select()
      .then((rows) =>
        rows.map((x) => {
          this.areaById.prime(x.id, x);
          return x;
        }),
      )
      .then((rows) => mapTo(rows, keys, (x) => x.code)),
  );

  dataUpdateById = new DataLoader<number, Dataupdate | null>((keys) =>
    db
      .table<Dataupdate>("dataupdate")
      .whereIn("id", keys)
      .select()
      .orderBy("date", "asc")
      .then((rows) =>
        rows.map((x) => {
          // TODO x [x] NOT SURE
          this.dataUpdateByKeyId.prime(x.keyid, [x]);
          return x;
        }),
      )
      .then((rows) => mapTo(rows, keys, (x) => x.id)),
  );

  dataUpdateByKeyId = new DataLoader<number, Dataupdate[] | null>((keys) =>
    db
      .table<Dataupdate>("dataupdate")
      .whereIn("keyid", keys)
      .select()
      .orderBy("date", "asc")
      // .then(mapToMany(keys, (x) => x.keyid)),
      .then((rows) => mapToMany(rows, keys, (x) => x.keyid)),
  );

  datarawById = new DataLoader<number, Dataraw | null>((keys) =>
    db
      .table<Dataraw>("dataraw")
      .whereIn("id", keys)
      .select()
      .then((rows) =>
        rows.map((x) => {
          this.datarawByKeyId.prime(x.keyid, x);
          return x;
        }),
      )
      .then((rows) => mapTo(rows, keys, (x) => x.id)),
  );

  datarawByKeyId = new DataLoader<number, Dataraw | null>((keys) =>
    db
      .table<Dataraw>("dataraw")
      .whereIn("keyid", keys)
      .select()
      .then((rows) =>
        rows.map((x) => {
          this.datarawById.prime(x.id, x);
          return x;
        }),
      )
      .then((rows) => mapTo(rows, keys, (x) => x.id)),
  );

  userById = new DataLoader<number, User | null>((keys) =>
    db
      .table<User>("users")
      .whereIn("id", keys)
      .select()
      .then((rows) =>
        rows.map((x) => {
          this.userByUsername.prime(x.username, x);
          return x;
        }),
      )
      .then((rows) => mapTo(rows, keys, (x) => x.id)),
  );

  userByUsername = new DataLoader<string, User | null>((keys) =>
    db
      .table<User>("users")
      .whereIn("username", keys)
      .select()
      .then((rows) =>
        rows.map((x) => {
          this.userById.prime(x.id, x);
          return x;
        }),
      )
      .then((rows) => mapTo(rows, keys, (x) => x.username)),
  );
}
