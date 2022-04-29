import { api } from "@serverless/cloud";
import { Peach, convert, obj, type } from "./natives/peach.js";



api.get("/api/:name", async (req, res) => {

  new Peach({
    steps: {
      respond: () => res.send(`<h1>hello ${req.query.last}, ${ req.params.name }!</h1>`)
    },
    instruct: {
      init: [
        { wait: 1 },
        "respond"
      ]
    }
  }).init();
  
});
