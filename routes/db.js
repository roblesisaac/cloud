import { api, params } from "@serverless/cloud";
import { Peach, convert, obj, type } from "../natives/peach.js";
// import fetch from "node-fetch";

const db = new Peach({
  steps: {
    dbApi: function() {
//       const body = {
//         collection:"sheets",
//         database:"uisheet",
//         dataSource:"peach",
//         projection: {"_id": 1}
//       };
      
//       const response = await fetch(params.MDE+"find", {
//       	method: "post",
//       	body: JSON.stringify(body),
//       	headers: {
//       	  "Content-Type": "application/json",
//       	  "Access-Control-Request-Headers": "*",
//       	  "api-key": params.MDB
//       	}
//       });
      
//       const data = await response.json();
      this.next(params.MDE);
    },
    serve: function(last) {
      const { res } = this;
      
      res.send({ message: "hola", last });
    }
  },
  instruct: {
    respond: (req, res) => [
      { req, res },
//       "dbApi",
      "serve"
    ]
  }
});

api.get("/:name/db", (req, res) => {  
  db.respond(req, res);  
});

export default db;
