import { Peach, obj } from "../natives/peach.js";

export default new Peach({
  instruct: {
    user: (user) => [
      { end: `<(-_-)> Missing permit, ${user} is...` }
    ]
  }
});
