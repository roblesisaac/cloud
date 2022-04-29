import { api } from "@serverless/cloud";
const { Peach, convert, obj, type } = require("natives/peach");

api.get("/api", async (req, res) => {
  res.send("<h1>Hello Serverless Cloud!</h1>");
});
