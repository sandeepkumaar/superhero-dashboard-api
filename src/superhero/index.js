import log from "../logger.js";
import express from "express";
import superHeroDao from "./dao.js";

const router = express.Router();

router.get("/all", (req, res, next) => {
  let { query = {}, params } = req;
  return superHeroDao
    .find(query)
    .then((results) => {
      return res.json({
        status: "OK",
        data: results,
      });
    })
    .catch(next);
});

router.get("/groupby/:field", (req, res, next) => {
  let { query = {}, params } = req;
  let { field } = params;
  return superHeroDao
    .aggregate(field)
    .then((results) => {
      return res.json({
        status: "OK",
        data: results,
      });
    })
    .catch(next);
});

export default router;
