import { api, params } from "@serverless/cloud";
import { Peach, convert, obj, type } from "../natives/peach.js";
import fetch from "node-fetch";

const db = new Peach({
  steps: {
    firstStep: function() {
      this.next("hi hola");
    },
    serve: function(last) {
      const { respond } = this;
      
      res.send({ param: params.MDE, last: Object.keys(last) });
    }
  },
  instruct: {
    respond: (req, res) => [
      { req, respond: res },
      "firstStep",
      "serve"
    ]
  }
});

api.get("/:name/db", (req, res) => {  
  db.respond(req, res);  
});

export default db;
