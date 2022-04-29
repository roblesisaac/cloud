import { api } from "@serverless/cloud";
import { Peach, convert, obj, type } from "./natives/peach.js";



api.get("/api", async (req, res) => {

  new Peach({
    steps: {
      respond: () => res.send(`<h1>hello response!</h1>`)
    },
    instruct: {
      init: [
        { wait: 10 },
        "respond"
      ]
    }
  }).init();
  
});
