import log from '../logger.js';
import config from 'config';
const {mongodb} = config;
import initConnection from '../mongo/index.js';


//
const {client, getCollection} = initConnection(mongodb.connectionString, mongodb.name)
const TABLE_NAME = "superheroes";
const collection = getCollection(TABLE_NAME);



export const find = async function(query, opts={sort: {_id: -1}, limit: 100}) {
  let _collection = await collection;
  log.info({query, opts, _collection}, 'find');

  let cursor = _collection.find(query)
  for(let [method, arg] of Object.entries(opts)) {
    if(typeof cursor[method] === 'function') {
      cursor = cursor[method](arg);
    }
  }
  return cursor.toArray();
};

export default {
  find

}