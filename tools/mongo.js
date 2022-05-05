import fetch from "node-fetch";

expor default new Peach({
    steps: {
      fetch: function(collection, next) {
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
        	headers
        };
        
        fetch(this.url, request).then(res => res.json())
          .then(next)
          .catch(next);
      },
      serve: function(data) {      
        res.send(data);
      }
    },
    instruct: {
      get: (collection) => [
        { url: params.MDB+"find" },
        { fetch: collection },
      ]
    }
  });
