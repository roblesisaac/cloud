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
            limit = filter.limit || 50,
            skip = filter.skip || 0;
            
        if(_id) filter._id = _id;
        
        this.action = _id ? "findOne" : "find";
        this.options = { filter, limit, skip };
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
          next({ action, collection, options });
//         db.handle(action, collection, options).then(next);
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
    let { method } = req;
    
    method = method.toLowerCase();
    
    handler[method](req, res)
      .catch(error => res.json(error));
};

api.get("/:sheetName/db", handle);

api.get("/:sheetName/db/:id", handle);

api.post("/:sheetName/db", handle);

export default handler;
