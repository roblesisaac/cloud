import { convert, obj, type } from "./utils.js";

function Memory(peach) {
  this._absorb(peach);
}

Memory.prototype._absorb = function(peach) {
  var bp = peach._blueprint,
      format = data => obj.copy(convert.toObject(data || {}, peach));

  var assignProps = (assignee, dataObj) => {
    if (!dataObj) return;

    var define = (prop, definer) => {
        Object.defineProperty(assignee, prop, definer);
      },
      defineGetterMethod = (value, prop) => {
        define(prop, {
          enumerable: true,
          get: value.bind(this)
        });
      },
      getAndSetFromPeach = (prop) => {
        define(prop, {
          enumerable: true,
          get: () => peach[prop],
          set: (newValue) => peach[prop] = newValue
        });
      };

    var data = format(dataObj);
    
    var assignProp = (prop) => {
      var value = data[prop];

      if (prop in assignee) {
        return;
      };

      if (prop in peach) {
        getAndSetFromPeach(prop);
        return;
      }

      if (typeof value == "function") {
        defineGetterMethod(value, prop);
        return;
      }

      assignee[prop] = value;
    };

    Object.keys(data).forEach(assignProp);
  };

  assignProps(peach, bp.state);
  assignProps(this, bp.state);
  assignProps(this, bp.input);
  
  return this;
};

Memory.prototype._remember = function() {
  if(!arguments.length) return this;
  
  var memory = this;
  
  var assignArg = (data) => {
    if(!type.isObject(data)) return;
    
    Object.keys(data).forEach(key => {
      var value = data[key],
          def = obj.tip(memory, key),
          { item, prop } = def;

      item[prop] = obj.deep(memory, value) || value;
    });
  };
  
  Array.from(arguments).forEach(assignArg);
  
  return this;
};

Memory.prototype._import = function() {
  if(!arguments.length) return this;
  
  var assignArg = (data) => {
    if(!type.isObject(data)) return;
    
    for(var key in data) {
      this[key] = data[key];
    }
//     Object.assign(this, data);
  };
  
  Array.from(arguments).forEach(assignArg);
  
  return this;
};

Memory.prototype._addTools = function(data) {
  var config = (prop) => {
    return {
      configurable: true,
      writable: true,
      value: data[prop]
    };
  };

  for (var prop in data) {
    Object.defineProperty(this, prop, config(prop));
  }

  return this;
}

export { Memory };
