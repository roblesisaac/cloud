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

api.get("/:name/db", (req, res) => {
  
  db.respond(req, res, function() {
    return `<h1> Hi ${ this.name } ${this.lastName}!!</h1>`
  });
  
});

export default db;
