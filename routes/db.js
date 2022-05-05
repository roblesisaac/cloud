import { api } from "@serverless/cloud";
import { Peach } from "../natives/peach.js";
import db from "../tools/mongo.js";

export default api.get("/:name/db", (req, res) => {
  
  const db = new Peach({
    steps: {
      serve: function(last, next) {
        db.get("sheets").then(next);
      }
    },
    instruct: {
      respond: ["serve"]
    }
  });
    
  db.respond();
  
});
