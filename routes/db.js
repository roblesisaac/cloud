import { api, params } from "@serverless/cloud";
import { Peach, convert, obj, type } from "../natives/peach.js";
// import fetch from "node-fetch";

const db = new Peach({
  steps: {
//     dbApi: function() {
//       const body = {
//         collection:"sheets",
//         database:"uisheet",
//         dataSource:"peach",
//         projection: {"_id": 1}
//       };
      
//       const resp = await fetch(params.MDE+"find", {
//       	method: "post",
//       	body: JSON.stringify(body),
//       	headers: {
//       	  "Content-Type": "application/json",
//       	  "Access-Control-Request-Headers": "*",
//       	  "api-key": params.MDB
//       	}
//       });
      
//       const data = await resp.json();
//       this.next(data);
//     },
    serve: function(data) {
      const { rez } = this;
      
      rez.send(typeof data);
    }
  },
  instruct: {
    respond: (req, rez) => [
      { rez },
//       "dbApi",
      "serve"
    ]
  }
});

api.get("/:name/db", (req, res) => {
  
  db.respond(req, res);
  
});

export default db;
