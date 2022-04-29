import { api } from "@serverless/cloud";
import { Peach, convert, obj, type } from "./natives/peach.js";



api.get("/api", async (req, res) => {

  new Chain({
    steps: {
      respond: () => res.send(`<h1>hello !</h1>`)
    },
    instruct: {
      init: ["respond"]
    }
  }).init();
  
});
