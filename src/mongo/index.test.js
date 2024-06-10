import { mongoQuery } from "./index.js";

let mapField = {
  publisher: "bio.publisher",
};
let mapValue = {
  date: (v) => new Date(v),
  publisher: (v) => v + "sf",
};

let x = mongoQuery(
  mapValue,
  mapField,
)({
  publisher: "name",
  status: ["sf", "sf"],
  count: { $gt: 0, $lt: 100 },
  date: "06/07/2024",
});

console.log(x);
