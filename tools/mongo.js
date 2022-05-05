import { params } from "@serverless/cloud";
import { Peach, obj } from "../natives/peach.js";
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
          ...options
        };
          
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
      },
      formatOptions: function() {
        var { options } = this;
        
        const formats = {
          limit: Number,
          skip: Number
        };
            
        Object.keys(options).forEach(prop => {
          
          if(obj.hasProp(formats, prop)) {
            var value = options[prop],
                method = formats[prop],
                newValue = typeof method == "function" ? method(value) : method;
                
            options[prop] = newValue;
          }
          
        });
          
      }
    },
    instruct: {
      get: (collection, options) => [
        { concat: "find", to: "url" },
        "formatOptions",
        "fetch",
      ],
      insertOne: (collection, options) => [
        { concat: "insertOne", to: "url" },
        "formatOptions",
        "fetch"
      ]
    }
  });
