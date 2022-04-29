import { api } from "@serverless/cloud";
import { Peach } from "../natives/peach.js";


const ui = new Peach({
  steps: {
    serveUi: function() {
      this.res.send("serving ui");
    }
  },
  instruct: {
    serve: (req, res) => [
      { req, res, sheetName: req.params.sheetName },
      "serveUi"
    ]
  }
});

api.get("/:sheetName", (req, res) => {
  render.serve(req, res);
});

export default ui;
