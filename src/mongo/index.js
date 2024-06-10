import { logger as log } from "../logger.js";
import { MongoClient } from "mongodb";
import parser from "mongo-parse";

let clients = new Map();

const connect = async function (url = "") {
  if (clients.has(url)) {
    return clients.get(url);
  }
  let client = MongoClient.connect(url)
    .then((client) => {
      log.info("mongo connnected %s", url);
      return client;
    })
    .catch((e) => {
      console.error("Error in connecting Mongo", e);
      log.error(e);
      return process.exit();
    });
  clients.set(url, client);
  return client;
};

export default function initConnection(url, connString) {
  let _client = connect(url);
  let getCollection = async function (name) {
    let client = await _client;
    if (client) {
      return client.db(connString).collection(name);
    }
    console.log("Connection Re-Initialised", url);
    return connect(url).then((client) => {
      return client.db(connString).collection(name);
    });
  };
  return {
    client: _client,
    getCollection,
  };
}

export const queryBuilder =
  (mapValue = {}, mapField = new Map()) =>
  (_query) => {
    let parserQuery = parser.parse(_query);
    let query = parserQuery.map(function (field, op) {
      let entries = Object.entries(op);
      let [operator, operand] = entries[0];
      console.log("args", field, operator, operand);
      if (Array.isArray(operand)) {
        operator = "$in";
      }
      operand = field in mapValue ? mapValue[field](operand) : operand;
      field = mapField.has(field) ? mapField.get(field) : field;

      return { [field]: { [operator]: operand } };
    });
    return query;
    //if(!formatter) return query;

    //parserQuery = parser.parse(_query);
    //return parserQuery.mapValues(function(field, value) {
    //  let fn = formatter[field];
    //  if(!fn) return value;
    //  return fn(value);
    //})
  };
