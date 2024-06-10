import log from "../logger.js";
import config from "config";
import { ObjectId } from "mongodb";
const { mongodb } = config;

import initConnection, { queryBuilder } from "../mongo/index.js";

//
const { client, getCollection } = initConnection(
  mongodb.connectionString,
  mongodb.name,
);
const collection = getCollection("superheroes");

const mapField = new Map([
  ["publisher", "biography.publisher"],
  ["alignment", "biography.alignment"],
  ["gender", "appearance.gender"],
  ["race", "appearance.race"],
]);
const mapValue = {};
let qb = queryBuilder(mapValue, mapField);

export const find = async function (
  query,
  opts = { sort: { _id: -1 }, limit: 100 },
) {
  let _collection = await collection;
  log.info({ query, opts, _collection }, "find");

  let cursor = _collection.find(qb(query));
  for (let [method, arg] of Object.entries(opts)) {
    if (typeof cursor[method] === "function") {
      cursor = cursor[method](arg);
    }
  }
  return cursor.toArray();
};

export const aggregate = async function (group, filter = {}) {
  let groupField = mapField.has(group) ? mapField.get(group) : group;

  let matchQuery = Object.keys(filter).length
    ? {
        $match: qb(filter),
      }
    : undefined;

  let _collection = await collection;
  let query = [
    matchQuery,
    {
      $group: {
        _id: {
          [group]: `$${groupField}`,
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        count: 1,
        [group]: `$_id.${group}`,
      },
    },
    {
      $sort: { count: -1 },
    },
  ];

  query = query.filter(Boolean);
  log.info({ query, _collection }, "aggregate");

  return _collection.aggregate(query).toArray();
};

export default {
  find,
  aggregate,
};
