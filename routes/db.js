import { api } from "@serverless/cloud";
import { Peach } from "../natives/peach.js";
import db from "../tools/mongo.js";

const handler = new Peach({
    steps: {
      assignNatives: function() {
        var { req } = this,
            params = req.params,
            collection = params.sheetName;
            
        this._remember({ params, collection });
      },
      buildOptions: function(req) {
        var filter = req.query,
            limit = filter.limit || 50;
          
        this.options = { filter, limit };
          
        delete filter.limit;
      },
      fetch: function(req, next) {
        db.get(this.collection, this.options).then(next);
      },
      insertDocument: function(last, next) {
        var { req } = this,
            data = req.body,
            method = Array.isArray(data) ? "insertOne" : "insertMany";
        
        db[method](this.collection, data).then(next);
      },
      serve: function(last) {
        const { res } = this;
        res.json(last);
      }
    },
    instruct: {
        get: (req, res) => [
            "assignNatives",
            { buildOptions: req },
            { fetch: req },
            "serve"    
        ],
        post: (req, res) => [
            "assignNatives",
            "insertDocument",
            "serve"
        ]
    }
  });

api.get("/:sheetName/db", handler.get);

api.post("/:sheetName/db", handler.post);

export default handler;
