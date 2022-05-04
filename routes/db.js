import { api, params } from "@serverless/cloud";
import { Peach, convert, obj, type } from "../natives/peach.js";

curl --location --request POST 'https://data.mongodb-api.com/app/data-ntloz/endpoint/data/beta/action/findOne' \
--header 'Content-Type: application/json' \
--header 'Access-Control-Request-Headers: *' \
--header `api-key: ${params.MDB}` \
--data-raw '{
    "collection":"<COLLECTION_NAME>",
    "database":"<DATABASE_NAME>",
    "dataSource":"peach",
    "projection": {"_id": 1}
}'

const db = new Peach({
  steps: {
    serve: function(message) {
      const { res } = this;
      
      res.send(message.call(this));
    }
  },
  instruct: {
    respond: (req, res, message) => [
      { 
        res,
        name: req.params.name,
        lastName: req.query.last
      },
      { serve: message }
    ]
  }
});

api.get("/:name/db", (req, res) => {
  
  db.respond(req, res, function() {
    return `<h1> Hi ${ this.name } ${this.lastName}!</h1>`
  });
  
});

export default db;
