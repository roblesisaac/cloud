import { api } from "@serverless/cloud";
import { Peach, convert, obj, type } from "./natives/peach.js";

const db = new Peach({
  steps: {
    serve: function (message) {
      { res, res } = this;
      
      res.send(`<h1>${ message } ${this.name}</h1>`)
    }
  },
  instruct: {
    respond: (req, res) => [
      { name: req.params.name },
      { 
        serve: "hi",
        req, res
      }
    ]
  }
});

api.get("/db/:name", async (req, res) => {
  db.respond(req, res);
});

export default db;
