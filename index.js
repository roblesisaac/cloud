try {
  import { api } from "@serverless/cloud";
  import { Peach } from "natives/peach";

  api.get("/api", async (req, res) => {
    res.send("<h1>Hello Serverless Cloud!</h1>");
  });
} catch (error) {
  api.get("/api", async (req, res) => {
    res.send(`<h1>${error}</h1>`);
  });
}
