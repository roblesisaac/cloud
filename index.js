import { api } from "@serverless/cloud";
import { Peach, convert, obj, type } from "./natives/peach.js";
import db from "./db.js";

api.get("/db/:name", async (req, res) => {
  db.send(req, res);
});
