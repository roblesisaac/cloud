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
      buildGetOptions: function() {
        var { req } = this,
            filter = req.query,
            limit = filter.limit || 50,
            skip = filter.skip || 0;
        
        this.action = "find";
        this.options = { filter, limit };
          
        delete filter.limit;
        delete filter.skip;
      },
      buildInsertOptions: function() {
        var { req } = this,
            document = req.body,
            action = Array.isArray(document) ? "insertMany" : "insertOne",
            options = action == "insertMany" 
                ? { documents: document } 
                : document;
          
        this._remember({ action, options });
      },
      fetch: function() {
        var { action, collection, options, next } = this;
          
        db.handle(action, collection, options).then(next);
      },
      serve: function(last) {
        const { res } = this;
        res.json(last);
      }
    },
    instruct: {
        get: (req, res) => [
            "assignNatives",
            "buildGetOptions",
            "fetch",
            "serve"    
        ],
        post: (req, res) => [
            "assignNatives",
            "buildInsertOptions",
            "fetch",
            "serve"
        ]
    }
  });

const handle = (req, res) => {
    const { method } = req;
    
    handler[method.toLowerCase()](req, res).catch(error => {
        res.json(error);
    });
}

api.get("/:sheetName/db", handle);

api.post("/:sheetName/db", handle);

export default handler;
