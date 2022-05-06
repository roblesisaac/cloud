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
      buildDeleteOptions: function() {        
          var { req } = this,
            _id = req.params.id,
            action = "deleteOne",
            filter = { _id: { $oid: _id } },
            options = { filter };

        this._remember({ action, options });
      },
      buildGetOptions: function() {
        var { req } = this,
            filter = req.query,
            _id = req.params.id,
            action = _id ? "findOne" : "find",
            limit = filter.limit || 50,
            skip = filter.skip || 0,
            select = filter.select,
            options = { filter, limit, skip, select };

        if(_id) {
            filter = { _id: { $oid: _id } };
            options = { filter, select };
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
      buildUpdateOneOptions: function() {
        var { req } = this,
            _id = req.params.id,
            action = "updateOne",
            filter = { _id: { $oid: _id } },
            update = {
                $set: req.body
            },
            options = {
                filter,
                update
            };

        this._remember({ action, options });
      },
      buildUpdateManyOptions: function() {
        var { req } = this,
            action = "updateMany",
            filter = req.query,
            update = {
                $set: req.body
            },
            options = {
                filter,
                update
            };

        this._remember({ action, options });
      },
      fetch: function() {
        var { action, collection, options, next } = this;

        db.handle(action, collection, options).then(next);
      },
      sanitizeResponse: function(last, next) {
        const data = Object.keys(last).length 
                        ? last.document || last.documents || last 
                        : last;
        
        next(data);
      },
      serve: function(last) {
        const { res } = this;         
        res.json(last);
      }
    },
    instruct: {
        init: (buildOptions, req, res) => [
            "assignNatives",
            buildOptions,
            "fetch",
            "sanitizeResponse",
            "serve"    
        ]
    }
});

const init = (req, res, buildOptions) => {
    handler.init(buildOptions, req, res)
        .catch(error => res.json(error))
}

api.get("/:sheetName/db", (req, res) => init(req, res, "buildGetOptions"));

api.get("/:sheetName/db/:id", (req, res) => init(req, res, "buildGetOptions"));

api.put("/:sheetName/db/:id", (req, res) => init(req, res, "buildUpdateOneOptions"));

api.put("/:sheetName/db", (req, res) => init(req, res, "buildUpdateManyOptions"));

api.post("/:sheetName/db", (req, res) => init(req, res, "buildInsertOptions"));

api.delet("/:sheetName/db/:id", (req, res) => init(req, res, "buildDeleteOptions"));

export default handler;
