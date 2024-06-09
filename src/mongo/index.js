import { logger as log } from "../logger.js";
import { MongoClient } from "mongodb";

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
