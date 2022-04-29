import { api } from "@serverless/cloud";
// import { Peach, convert, obj, type } from "./natives/peach";

api.get("/api", async (req, res) => {
  res.send("<h1>Hello Serverless Cloud!</h1>");
});
