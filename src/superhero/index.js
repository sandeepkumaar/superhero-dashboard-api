import log from "../logger.js";
import express from "express";
import superHeroDao from "./dao.js";

const router = express.Router();

router.post("/search", (req, res, next) => {
  let { body } = req;
  return superHeroDao
    .find(body)
    .then((results) => {
      return res.json({
        status: "OK",
        data: results,
      });
    })
    .catch(next);
});

router.post("/groupby/:field", (req, res, next) => {
  let { query = {}, params, body } = req;
  let { field } = params;

  return superHeroDao
    .aggregate(field, body)
    .then((results) => {
      return res.json({
        status: "OK",
        data: results,
      });
    })
    .catch(next);
});

export default router;
