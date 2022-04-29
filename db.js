import { api } from "@serverless/cloud";
import { Peach, convert, obj, type } from "./natives/peach.js";

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

api.get("/db/:name", async (req, res) => {
  
  db.respond(req, res, function() {
    return `<h1> Hi ${ typeof this } </h1>`
  });
  
});

export default db;
