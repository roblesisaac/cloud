import { api } from "@serverless/cloud";
import { Peach } from "../natives/peach.js";
import db from "../tools/mongo.js";

const handler = new Peach({
    steps: {
      fetch: function(last, req, next) {
        const collection = req.params.sheetName;
        const filter = req.body || req.query;
        
        db.get(collection, { filter }).then(next);
      },
      serve: function(last) {
        const { res } = this;
        res.json("last")
      }
    },
    instruct: (req, res) => [
      { res },
//       { fetch: req },
      "serve"
    ]
  }).run();

export default api.get("/:sheetName/db", (req, res) => {  
  handler.run(req, res);  
});
