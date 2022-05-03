var convert = {
  toArray: (data) => {
    return Array.isArray(data)
      ? data 
      : Object.prototype.toString.call(data) == "[object Arguments]"
      ? Array.from(data)
      : [data];
  },
  toInstruct: (steps, args) => {
    return (
      Array.isArray(steps)
      ? steps
      : typeof steps == "function"
      ? steps.apply(this, args || []) 
      : [steps]
    ).flat();
  },
  toObject: (data, caller) => {
    caller = caller || this;
    if (typeof data == "function") data = data.call(caller);
    return typeof data == "object" && !Array.isArray(data) ? data : {
      data
    };
  }
};

export { obj, convert, type };
