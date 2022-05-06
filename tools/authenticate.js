import { Peach, obj } from "../natives/peach.js";

export default new Peach({
  instruct: {
    user: (user) => [
      (res, next) => { next(`<(-_-)> Missing permit, ${user.username} is...`); }
    ]
  }
});
