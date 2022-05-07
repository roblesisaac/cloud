import { Peach, obj } from "../natives/peach.js";
import { data } from "@serverless/cloud";

export default new Peach({
//   steps: {
//     fetchPermit: function() {
//       data.getByLabel("label1", username);
//     }
//   },
  instruct: {
//     findPermitByUser: (user) => [
      
//     ],
    user: (user) => [
      { log: user }
    ]
  }
});
