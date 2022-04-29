import { api } from "@serverless/cloud";

api.get("/api", async (req, res) => {
  res.send("<h1>Hello Serverless Cloud!</h1>");
});
