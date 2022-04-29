import { api } from "@cloud";
import { Peach } from "../natives.peach.js";


const render = new Peach({
  steps: {
    serveUi: function() {
      this.res.send("serving ui");
    }
  },
  instruct: {
    serve: (req, res) => [
      { req, res },
      "serveUi"
    ]
  }
});

api.send()
