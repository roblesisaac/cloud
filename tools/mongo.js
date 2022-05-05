import { params } from "@serverless/cloud";
import { Peach } from "../natives/peach.js";
import fetch from "node-fetch";

export default new Peach({
    input: {
        url: `https://data.mongodb-api.com/app/${params.DB_ID}/endpoint/data/beta/action/`
    },
    steps: {
      fetch: function() {
        var { collection, options, next, url } = this; 
          
        const body = {
          collection,
          database: "uisheet",
          dataSource: "peach",
          ...options,
          url
        };
          
        res.json(body);
          
        return;
        
        const headers = {
          "Content-Type": "application/json",
          "Access-Control-Request-Headers": "*",
          "api-key": params.DB_KEY
        };
        
        const clientRequest = {
            method: "post",
            body: JSON.stringify(body),
            headers
        };
        
        fetch(url, clientRequest).then(res => res.json())
          .then(next)
          .catch(next);
      }
    },
    instruct: {
      get: (collection, options) => [
        { concat: "find", to: "url" },
        "fetch",
      ],
      insertOne: (collection, options) => [
        { concat: "insertOne", to: "url" },
        "fetch"
      ]
    }
  });
