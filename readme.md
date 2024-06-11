## Super Hero Service

Super hero service exposing apis for data visulisation.  

#### Uses
- Express
- Pino logger
- Typecheck, lint and format
- Github workflow CI scripts
- Dockerifiles

#### Database
- Mongodb

## Setup
Requirements: Nodejs, Mongodb server
### Setup database
Ingest Data using `mongoimport`
```
curl https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/all.json
mongoimport --db yourDatabaseName --collection yourCollectionName --file data.json --jsonArray
```
change the mongo config in `./config/local-dev.json`

## Quick start
```
$ npm install
$ npm start // runs in prod mode
```

## Commands
```
$ npm run start:local // runs in dev mode
```

