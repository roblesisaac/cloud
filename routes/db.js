import { api, params } from "@serverless/cloud";
import { Peach, convert, obj, type } from "../natives/peach.js";
// import fetch from "node-fetch";

const db = new Peach({
  steps: {
    dbApi: function() {
      this.next("hello");
    },
    serve: function() {
      const { res } = this;
      
      res.send({ last: params.MDE });
    }
  },
  instruct: {
    respond: (req, res) => [
      { req, res },
      // "dbApi",
      "serve"
    ]
  }
});

api.get("/:name/db", (req, res) => {  
  db.respond(req, res);  
});

export default db;
