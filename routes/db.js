import { api, params } from "@serverless/cloud";
import { Peach, convert, obj, type } from "../natives/peach.js";
import fetch from "node-fetch";

const db = new Peach({
  steps: {
    dbApi: function(last, next) {
      const body = {
        collection:"sheets",
        database:"uisheet",
        dataSource:"peach"
      };
      
      const headers = {
        "Content-Type": "application/json",
        "Access-Control-Request-Headers": "*",
        "api-key": params.MDB
      };
      
      const request = {
      	method: "post",
      	body: JSON.stringify(body),
      	headers
      };
      
      const url = params.MDE+"find";
      
      fetch(url, request).then(res => res.json())
        .then(next)
        .catch(next);
    },
    serve: function(data) {
      const { rez } = this;
      
      rez.send(data);
    }
  },
  instruct: {
    respond: (req, rez) => [
      { rez },
      "dbApi",
      "serve"
    ]
  }
});

export default api.get("/:name/db", (req, res) => {
  
  db.respond(req, res);
  
});
