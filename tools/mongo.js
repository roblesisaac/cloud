import { params } from "@serverless/cloud";
import { Peach } from "../natives/peach.js";
import fetch from "node-fetch";

export default new Peach({
    steps: {
      buildUrl: function(method) {
        this.url = `https://data.mongodb-api.com/app/${params.DB_ID}/endpoint/data/beta/action/${method}`;        
      },
      fetch: function(collection, filter, next) {
        const body = {
          collection,
          database: "uisheet",
          dataSource: "peach",
          filter
        };
        
        const headers = {
          "Content-Type": "application/json",
          "Access-Control-Request-Headers": "*",
          "api-key": params.DB_KEY
        };
        
        const request = {
            method: "post",
            body: JSON.stringify(body),
            headers
        };
        
        fetch(this.url, request).then(res => res.json())
          .then(next)
          .catch(next);
      }
    },
    instruct: {
      get: (collection, filter) => [
        { buildUrl: "find" },
        { fetch: [collection, filter] },
      ]
    }
  });
