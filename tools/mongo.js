import { params } from "@serverless/cloud";
import { Peach } from "../natives/peach.js";
import fetch from "node-fetch";

export default new Peach({
    steps: {
      fetch: function(collection, filter, next) {
        const body = {
          collection,
          database: "uisheet",
          dataSource: "peach"
        };
        
        const headers = {
          "Content-Type": "application/json",
          "Access-Control-Request-Headers": "*",
          "api-key": params.MDB
        };
        
        const request = {
        	method: "post",
        	body: JSON.stringify(body),
        	headers,
            filter
        };
        
        fetch(this.url, request).then(res => res.json())
          .then(next)
          .catch(next);
      }
    },
    instruct: {
      get: (collection, filter) => [
        { url: params.MDE+"find" },
        { fetch: [collection, filter] },
      ]
    }
  });
