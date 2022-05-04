import { api, params } from "@serverless/cloud";
import { Peach, convert, obj, type } from "../natives/peach.js";
// import fetch from "node-fetch";

const db = new Peach({
  steps: {
    firstStep: function() {
      console.log("hi");
    },
    serve: function(last) {
      const { res } = this;
      
      res.send({ param: params.MDE, last: Object.keys(last) });
    }
  },
  instruct: {
    respond: (req, res) => [
      { req, res },
      "firstStep",
      "serve"
    ]
  }
});

api.get("/:name/db", (req, res) => {  
  db.respond(req, res);  
});

export default db;
