import { api } from "@serverless/cloud";
import { Peach, convert, obj, type } from "./natives/peach.js";

const db = new Peach({
  steps: {
    serve: function (message) {
      const { req, res } = this;
      
      res.send(message(req, res))
    }
  },
  instruct: {
    respond: (req, message) => [
      { 
        name: req.params.name,
        lastName: req.query.last
      },
      { 
        serve: message
      }
    ]
  }
});

api.get("/db/:name", async (req, res) => {
  db.respond(req, function(req, res) {
    return `<h1>Hola ${this.name} ${ this.lastName }</h1>`
  });
});

export default db;
