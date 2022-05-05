import { api } from "@serverless/cloud";
import { Peach } from "../natives/peach.js";
import db from "../tools/mongo.js";

const handler = new Peach({
    steps: {
      buildOptions: function(req) {
        var filter = req.query,
            limit = filter.limit || 50;
          
        this.options = { filter, limit };
          
        delete filter.limit;
      },
      fetch: function(req, next) {
        const collection = req.params.sheetName;
        
        db.get(collection, this.options).then(next);
      },
      serve: function(last) {
        const { res } = this;
        res.json(last);
      }
    },
    instruct: {
        get: (req, res) => [
            { buildOptions: req },
            { fetch: req },
            "serve"    
        ],
        post: (req, res) => [
            (res, next) => next("hello"),
            "serve"
        ]
    }
  });

api.get("/:sheetName/db", (req, res) => res.json("hi"));

api.post("/:sheetName/db", handler.post);

export default handler;
