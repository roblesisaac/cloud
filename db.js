import { api } from "@serverless/cloud";
import { Peach, convert, obj, type } from "./natives/peach.js";

const db = new Peach({
  steps: {
    respond: function (req, res) {
      res.send(`<h1>hello ${ req.params.name } ${req.query.last}!!</h1>`)
    }
  },
  instruct: {
    send: (req, res) => [
      { respond: [req, res] }
    ]
  }
  });



export { db };
