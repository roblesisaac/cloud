import { api } from "@serverless/cloud";
import { Peach } from "../natives/peach.js";
import db from "../tools/mongo.js";

const handler = new Peach({
    steps: {
//       buildOptions: function() {
//         var filter = req.query,
//             limit = filter.limit || 50;
          
//         this.options = { filter, limit };
          
//         delete filter.limit;
//       },
      fetch: function(req, next) {
        const collection = req.params.sheetName;
        
        db.get(collection, { filter: req.query }).then(next);
      },
      serve: function(last) {
        const { res } = this;
        res.json(last);
      }
    },
    instruct: (req, res) => [
      { res },
//       { buildOptions: req },
      { fetch: req },
      "serve"
    ]
  });

api.all("/:sheetName/db", handler.run);

export default handler;
