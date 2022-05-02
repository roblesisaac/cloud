import { api } from "@serverless/cloud";
import { Peach } from "../natives/peach.js";

const ui = new Peach({
  steps: {
    serveUi: function() {
      const { res, sheetName, req } = this;
      
//       var keys = [
//         "rawHeaders",
//         "url",
//         "method",
//         "client",
//         "ip",
//         "baseUrl",
//         "originalUrl",
//         "_parsedUrl",
//         "route"
//        ];
      
//       var data = {};
      
//       keys.forEach(key => data[key] = req[key]);
      
      res.json(Object.keys(req));
    }
  },
  instruct: {
    render: (req, res) => [
      {
        res, req,
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
