/**
 * Helper functions that moke args
 * match the provided keys array.
 *
 * @see https://github.com/graphql/dataloader
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

import db from "../db";

export function cleanArgs(args: {
  [key: string]: unknown;
}): { [key: string]: unknown } {
  delete args.format;
  delete args.search;
  return args;
}

export function searchAreaId(inputArgs: {
  [key: string]: unknown;
}): { [key: string]: unknown } | undefined {
  if (inputArgs.area_id) {
    return { id: (inputArgs.area_id as number) || null };
  } else {
    if (inputArgs.area_code) {
      return { code: (inputArgs.area_code as string)?.trim() || null };
    } else if (inputArgs.area_name) {
      return { name: (inputArgs.area_name as string)?.trim() || null };
    }
  }
}

export function searchStationId(inputArgs: {
  [key: string]: unknown;
}): { [key: string]: unknown } | undefined {
  if (inputArgs.station_id) {
    return { id: (inputArgs.station_id as number) || null };
  } else {
    if (inputArgs.station_code) {
      return { code: (inputArgs.station_code as string)?.trim() || null };
    } else if (inputArgs.station_name) {
      return { name: (inputArgs.station_name as string)?.trim() || null };
    }
  }
}

export function makeQueryRawSearchDate(inputArgs: {
  [key: string]: unknown;
}): string {
  if (
    inputArgs.day ||
    (inputArgs.start && inputArgs.end && inputArgs.start === inputArgs.end)
  ) {
    const startDate = inputArgs.day ? inputArgs.day : inputArgs.start;
    return `date >= to_date('${startDate}','DD/MM/YYYY') and date < to_date('${startDate}','DD/MM/YYYY') + INTERVAL '1 day'`;
  } else if (inputArgs.start && inputArgs.end) {
    return `date >= to_date('${inputArgs.start}','DD/MM/YYYY') AND date <= to_date('${inputArgs.end}','DD/MM/YYYY')`;
  } else if (inputArgs.start) {
    return `date >= to_date('${inputArgs.start}','DD/MM/YYYY') AND date <= NOW()`;
  } else if (inputArgs.end) {
    return `date >= to_date('01/01/1950','DD/MM/YYYY') AND date <= to_date('${inputArgs.end}','DD/MM/YYYY')`;
  }
  return "";
}

export function searchSensorId(inputArgs: {
  [key: string]: unknown;
}): { [key: string]: unknown } | undefined {
  if (inputArgs.sensor_id) {
    return { id: (inputArgs.sensor_id as number) || null };
  } else {
    if (inputArgs.sensor_code) {
      return { code: (inputArgs.sensor_code as string)?.trim() || null };
    } else if (inputArgs.sensor_name) {
      return { name: (inputArgs.sensor_name as string)?.trim() || null };
    }
  }
}

export async function getSensorId(inputArgs: {
  [key: string]: unknown;
}): Promise<number> {
  const query = db.table("sensor").select("id").first();

  if (inputArgs.sensor_id) {
    query.orWhere({ id: inputArgs.sensor_id as number });
  }
  if (inputArgs.sensor_code) {
    query.orWhere({ code: (inputArgs.sensor_code as string)?.trim() || null });
  }
  if (inputArgs.sensor_name) {
    query.orWhere({ name: (inputArgs.sensor_name as string)?.trim() || null });
  }

  const searchSensorId = await query;

  return searchSensorId && searchSensorId.id ? searchSensorId.id : 0;
}
