import { api } from "@serverless/cloud";
import { Peach } from "../natives/peach.js";
import db from "../tools/mongo.js";

export default api.get("/:sheetName/db", (req, res) => {
  
  new Peach({
    steps: {
      serve: function(last, next) {
        const collection = req.params.sheetName;
        const filter = req.query;
        
        db.get(collection, filter).then(data => {
          res.send(data);
        });
      }
    },
    instruct: ["serve"]
  }).run();
  
});
