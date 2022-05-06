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
          "api-key": params.DB_TOKEN
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
        var { options, next } = this,
            { filter } = options;

        const formats = {
            limit: Number,
            skip: Number,
            select: (value) => {
                if(!value) return;

                let projection = {};

                value.split(" ").forEach(selection => {
                    const removeProp = selection.includes("-");

                    selection = selection.replace("-", "");        
                    projection[selection] = removeProp ? 0 : 1;
                });

                options.projection = projection;
                delete options.select;
            }
        };
            
        Object.keys(options).forEach(prop => {
          
          if(!obj.hasProp(formats, prop)) {
            return;
          }

          var value = options[prop],
              method = formats[prop],
              newValue = typeof method == "function" ? method(value) : method;

          if(newValue) options[prop] = newValue;
          if(filter) delete filter[prop];
          
        });
        
        next();
      },
      needsFormat: function() {
        var valids = ["findOne", "find"],
            { method, next } = this;
            
        next(valids.includes(method)); 
      }
    },
    instruct: {
      handle: (method, collection, options) => [
        { concat: method, to: "url" },
        { if: "needsFormat", true: "formatOptions" },
        "fetch"
      ]
    }
  });
