import { api } from "@serverless/cloud";
import { Peach } from "../natives/peach.js";

const ui = new Peach({
  steps: {
    serveUi: function() {
      const { res, sheetName, params } = this;
      
      const data = {};
      
      Object.keys(this).forEach(param => data[param] = this[param]);
      
      res.json(data);
    }
  },
  instruct: {
    render: (req, res) => [
      {
        req,
        res,
        params: req.params
      },
      { sheetName: "params.sheetName" },
      "serveUi"
    ]
  }
});

api.get("/:sheetName", (req, res) => {
  ui.render(req, res);
});

export default ui;
