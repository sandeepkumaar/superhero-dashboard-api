import log from "../logger.js";
import config from "config";
const { mongodb } = config;
import initConnection from "../mongo/index.js";

//
const { client, getCollection } = initConnection(
  mongodb.connectionString,
  mongodb.name,
);
const TABLE_NAME = "superheroes";
const collection = getCollection(TABLE_NAME);

export const find = async function (
  query,
  opts = { sort: { _id: -1 }, limit: 100 },
) {
  let _collection = await collection;
  log.info({ query, opts, _collection }, "find");

  let cursor = _collection.find(query);
  for (let [method, arg] of Object.entries(opts)) {
    if (typeof cursor[method] === "function") {
      cursor = cursor[method](arg);
    }
  }
  return cursor.toArray();
};

const mapper = new Map([
  ["publisher", "biography.publisher"],
  ["alignment", "biography.alignment"],
  ["gender", "appearance.gender"],
  ["race", "appearance.race"],
]);
export const aggregate = async function (group, opts) {
  let groupField = mapper.has(group) ? mapper.get(group) : group;

  let _collection = await collection;
  let query = [
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
  log.info({ query, opts, _collection }, "aggregate");

  return _collection.aggregate(query).toArray();
};

export default {
  find,
  aggregate,
};
