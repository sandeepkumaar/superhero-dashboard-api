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

const defaultProjections = {
  _id: 0,
  id: 1,
  name: 1,
  slug: 1,
  intelligence: "$powerstats.intelligence",
  strength: "$powerstats.strength",
  speed: "$powerstats.speed",
  durability: "$powerstats.durability",
  power: "$powerstats.power",
  combat: "$powerstats.combat",
  gender: "$appearance.gender",
  race: "$appearance.race",
  height: "$appearance.height",
  weight: "$appearance.weight",
  eyeColor: "$appearance.eyeColor",
  hairColor: "$appearance.hairColor",
  publisher: "$biography.publisher",
  fullName: "$biography.fullName",
  placeOfBirth: "$biography.placeOfBirth",
  firstAppearance: "$biography.firstAppearance",
  image: "$images.md",
};

export const find = async function (filter, opts = {}) {
  let { limit = 100, ...restOpts } = opts;
  let _collection = await collection;
  let query = qb(filter);

  log.info({ query, opts, _collection }, "find");

  let cursor = _collection
    .find(qb(query), {
      projection: defaultProjections,
    })
    .limit(limit);

  for (let [method, arg] of Object.entries(restOpts)) {
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
