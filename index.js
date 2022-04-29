import { api } from "@serverless/cloud";
import test from "db.js";
// import { Peach, convert, obj, type } from "./natives/peach.js";

api.get("/api", async (req, res) => {
  res.send(`<h1>${test()}</h1>`);
});
