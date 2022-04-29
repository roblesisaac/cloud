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

var addMethodTo = (type, name, value) => {
  var proto = type.prototype;
  if (!proto || proto[name]) return;
  Object.defineProperty(proto, name, {
    value,
    enumerable: false,
    writable: true
  });
};

addMethodTo(Array, "loop", function(method, i = 0) {
  var next = () => {
      this.loop(method, i + 1);
    },
    finish = (promise) => {
      promise = promise || this._promise;

      if (promise) promise.call(this);
    };

  if (i == this.length) {
    finish();
    return {
      then: finish
    };
  }

  method(i, this[i], function() {
    setTimeout(next);
  });

  return {
    then: (promise) => {
      this._promise = promise;
    }
  };
});
addMethodTo(Array, "excludes", function(keyword) {
  return this.indexOf(keyword) == -1;
});
addMethodTo(Array, "includes", function(keyword) {
  return this.indexOf(keyword) > -1;
});
addMethodTo(Array, "find", function(filter) {

});

var obj = {
  copy: function(object) {
    if (null === object || typeof object != "object") return object;
    var copy = object.constructor();
    for (var attr in object) {
      if (object.hasOwnProperty(attr)) copy[attr] = object[attr];
    }
    return copy;
  },
  assignNative: function(obj, prop, value) {
    Object.defineProperty(obj, prop, {
      enumerable: false,
      writable: true,
      value
    });
  },
  deep: function(object, props, sliced) {
    if (!object || !props) return;

    if (!sliced) {
      if (typeof props == "string") props = props.split(".");
      if (!props.slice) return props;
      sliced = props.slice();
    }

    var nested = object[sliced.shift()];

    return sliced.length ?
      this.deep(nested, props, sliced) :
      nested;
  },
  hasProp: function(object, prop) {
    return !object ?
      false :
      Object.keys(object).includes(prop) || !!object[prop];
  },
  watch: function(object, prop, fn) {
    var og = object[prop];
    Object.defineProperty(object, prop, {
      get: () => og,
      set: function(value) {
        if (fn) fn(value);
        og = value;
      }
    });
  },
  tip: function(obj, props, sliced) {
    if (!obj) return;

    if (!Array.isArray(props)) props = props.split(".");

    var arrProps = sliced ? props : props.slice(),
      nested = arrProps.length > 1 ? obj[arrProps.shift()] : obj;

    return arrProps.length > 1 ?
      this.tip(nested, arrProps, true) : {
        obj: nested,
        prop: arrProps[0]
      };
  }
};

var type = {
  isObject: obj => obj && !Array.isArray(obj) && typeof obj == "object"
};

addMethodTo(String, "includes", function() {
  "use strict";
  return String.prototype.indexOf.apply(this, arguments) != -1;
});
addMethodTo(String, "excludes", function() {
  "use strict";
  return String.prototype.indexOf.apply(this, arguments) == -1;
});
addMethodTo(String, "matchCount", function() {
  var str = this.valueOf(),
    matches = 0;

  for (var i in arguments) {
    var value = arguments[i];
    if (str.includes(value)) matches++;
  }

  return matches;
});
addMethodTo(String, "excludesAll", function() {
  var matchCount = this.matchCount.apply(this, arguments);

  return !matchCount;
});
addMethodTo(String, "includesAll", function() {
  var args = arguments,
    matchCount = this.matchCount.apply(this, args);

  return matchCount == args.length;
});
addMethodTo(String, "includesAny", function() {
  var matchCount = this.matchCount.apply(this, arguments);

  return !!matchCount;
});

module.exports = { obj, convert, type };
