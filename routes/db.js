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
            _id = req.params.id,
            action = _id ? "findOne" : "find",
            limit = filter.limit || 50,
            skip = filter.skip || 0,
            options = { filter, limit, skip };
          
        if(_id) {
            filter = { _id: { $oid: _id } };
            options = { filter };
        }
        
        this._remember({ action, options });
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
        init: (buildOptions, req, res) => [
            "assignNatives",
            buildOptions,
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

api.get("/:sheetName/db", (req, res) => handler.init("buildGetOptions", req, res));

api.get("/:sheetName/db/:id", (req, res) => handler.init("buildGetOptions", req, res));

api.post("/:sheetName/db", (req, res) => handler.init("buildInsertOptions", req, res));

export default handler;
