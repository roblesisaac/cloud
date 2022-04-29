const { convert, obj, type } = require("./utils");

const globalSteps = {
  "&": function(res) {
    if (!this._conditions) {
      this._addTools({
        _conditions: [res]
      });
    }
  },
  alert: function(messageProp) {
    var message = obj.deep(this, messageProp);
    alert(message || messageProp);
  },
  each: function(res, next) {
    var each = this._step.each,
        getData = each.each,
        iteration = each.run || each.async;

    var methodForEach = (i, item, nxt) => {
      this._remember({ i, item });
      iteration.method(this, nxt);
    };

    getData.method(this, (data) => {
      if (!Array.isArray(data)) {
        console.error({ notAnArray: data });
        return;
      }

      if (each.async) {
        data.loop(methodForEach).then(next);
        return;
      }

      for (var i = 0; i < data.length; i++) {
        methodForEach(i, data[i]);
      }

      next();
    });
  },
  end: function (message) {
    this._addTools({ _endAll: true });
    this.next(message);
  },
  error: function(error) {
    var _error = "<(-_-)> " + error,
        step = this._step;
        
    return step.handleError(this, { _error });
  },
  has: function(props) {
    var item = obj.deep(this, props);
    this.next(!!item || item === 0);
  },
  if: function(res, next) {
    var data = this._step.if,
        condition = data.if || data.switch;

    condition.method(this, (res) => {
      var answer = data[res],
        allTrue = arr => !arr.filter(item => !item).length,
        conds = this._conditions;

      if (conds) {
        answer = data[allTrue(conds)];
      }

      delete this._conditions;

      if (!answer) {
        next();
        return;
      };

      answer.method(this, next);
    });
  },
  incr: function(prop) {
    var counter = obj.tip(this, prop);
    counter.obj[counter.prop]++;
  },
  isString: function(item) {
    var constant = obj.deep(this, item);
    
    this.next(typeof constant == "string");
  },
  log: function(messageProp) {
    var message = obj.deep(this, messageProp);

    if (!message && message != 0) message = messageProp;

    console.log(message);
  },
  restart: function(res, next) {
    var step = this._step,
        restart = () => step.firstStep().method(this);

    setTimeout(restart);
  },
  wait: function(time, next) {
    setTimeout(next, time * 1000);
  }
}

module.exports = { globalSteps };
