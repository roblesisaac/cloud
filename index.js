import { api } from "@serverless/cloud";
import { Peach, convert, obj, type } from "./natives/peach.js";

const server = new Peach({
  steps: {
    respond: function (req, res) {
      res.send(`<h1>hello ${ req.params.name } ${req.query.last}!</h1>`)
    }
  },
  instruct: {
    init: (req, res) => { respond: [req, res] }
  }
  });

api.get("/api/:name", async (req, res) => {

  server.init(req, res);
  
});
