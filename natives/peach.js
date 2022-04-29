const { convert, obj, type } = require("./utils");
const { Memory } = require("./memory");
const { globalSteps } = require("./globalSteps");

function Peach(blueprint) {
  var instruct = blueprint.instruct;

  var natives = {
    _blueprint: obj.copy(blueprint),
    _steps: Object.assign({}, this._library.steps, blueprint.steps)
  };

  Object.keys(natives).forEach((prop) => {
    obj.assignNative(this, prop, natives[prop]);
  });

  if (!type.isObject(instruct)) {
    buildPeach(instruct, this, "run");
    return;
  }

  for (var vName in instruct) {
    buildPeach(instruct[vName], this, vName);
  }
}

Peach.prototype._library = {
  peachs: {},
  specials: ["if", "each", "setup"],
  steps: globalSteps
};

Peach.prototype.addGlobalSteps = function(steps) {
  Object.assign(Peach.prototype._library.steps, steps);
};

function buildPeach(stepsArr, peach, peachName) {
  var getSteps = function(args) {
    var instructs = convert.toInstruct(stepsArr, args);
    return buildSteps(instructs, peach, peachName);
  };
  
  var peachMethod = function(memory, parentSpecial, peachIsForeign) {
    var _args = arguments;
    
    var getMemory = (res, _rej, _peachName) => {
      var isMemory = obj.deep(memory, "constructor.name") == "Memory";
      
      if(isMemory) {
        memory._res = [res].concat(memory._res);
            
        if(peachIsForeign || memory._args[1]) {
          memory._absorb(peach);
        }
        
        return memory;
      }

      var tools = { _res: [res], _rej, _peachName, _args: [_args] };
      
      return new Memory(peach)._addTools(tools);
    };

    return new Promise(function(res, rej) {
      var memry = getMemory(res, rej, peachName),
          args = memry._args,
          arg = args[1] ? args.shift() : args[0];
          steps = getSteps(arg);
          
      steps.method(memry, null, parentSpecial);
    });
  };

  peachMethod.steps = getSteps;
  peachMethod.step = getStep;
  peachMethod._ = function(args) {
    return function(res, next) {
      var { _args, _step } = this,
          { specialProp, peach, methodName } = _step;
          
      _args.unshift(convert.toArray(args))
      
      peachMethod(this, specialProp, peach[methodName]).then(next);
    }
  }; 

  if (peachName != "run") {
    peach._library.peachs[peachName] = peachMethod;
  }

  obj.assignNative(peach, peachName, peachMethod);
}

function getStep(sIndex, args, steps) {
  steps = steps || this.steps(args);
  
  return steps.index == sIndex || steps.missingIndex
    ? steps
    : getStep(sIndex, args, steps.nextStep() || { missingIndex: sIndex });
}

function buildSteps(stepsArr, peach, peachName, prev, stepIndex, specialProp) {
  if (!stepsArr || !stepsArr.length || stepIndex == stepsArr.length) {
    return;
  }

  var index = stepIndex || 0,
      stepPrint = stepsArr[index],
      isObj = type.isObject(stepPrint),
      specials = peach._library.specials;

  var methodName = typeof stepPrint == "string" 
        ? stepPrint
        : type.isObject(stepPrint)
        ? Object.keys(stepPrint)[0]
        : stepPrint.name || typeof stepPrint;

  var buildSub = function(index, sProp, instructs, previous) {
    instructs = instructs || stepsArr;
    previous = previous || this;
    sProp = sProp || specialProp;
    return buildSteps(instructs, peach, peachName, previous, index, sProp);
  };

  return {
    peach,
    peachName,
    isFinalStep: stepsArr.length == index+1,
    isSpecial: specials.includes(methodName),
    isVariation: !!peach[methodName] || methodName == "peachMethod",
    index,
    methodName,
    prev,
    stepPrint,
    init: function() {
      var setupComplete;

      var setupSpecial = (special) => {
        var isSpecial = obj.hasProp(stepPrint, special);

        if (!isSpecial || setupComplete) {
          return;
        }

        var specialData = {};

        for (var sProp in stepPrint) {
          var instructs = convert.toArray(stepPrint[sProp]).flat();
          specialData[sProp] = buildSub(0, sProp, instructs, prev);
        }

        this[special] = specialData;
        setupComplete = true;
      };

      specials.forEach(setupSpecial);

      return this;
    },
    firstStep: function() {
      return this.prev ?
        this.prev.firstStep() :
        this;
    },
    nextStep: function() {
      return buildSub.call(this, index + 1);
    },
    handleError: function(memory, error) {
      var { _rej, _peachName } = memory,
        errMessage = {
        error,
        methodName,
        peachName,
        _peachName,
        prev,
        stepPrint
      };
      
      if (_rej && typeof _rej == "function") {
        _rej(errMessage);
        return;
      }

      console.error(errMessage);
      return;
    },
    method: function(memory, rabbitTrail, parentSpecial) {
      var { nextStep, isFinalStep, isSpecial, isVariation, handleError } = this,
          { _res, _args } = memory;

      var method = peach[methodName] || peach._steps[methodName] || stepPrint,
          theSpecial = specialProp || parentSpecial,
          updater = theSpecial == "if" ? "_condition" : "res",
          self = this;

      var next = function(res) {
        if (arguments.length) {
          if (theSpecial && memory._conditions) {
            memory._conditions.push(res);
          } else {
            memory[updater] = Array.from(arguments);
          }
        }

        if (isFinalStep || memory._endAll) {
          var resolve = rabbitTrail || _res.shift();

          if (typeof resolve == "function") {
            var output = memory[updater] || [];
            resolve(output[0]);
          }

          return;
        }

        nextStep.call(self).method(memory, rabbitTrail, parentSpecial);
      };

      var setupArgs = () => {
        var arr = isObj && !isSpecial 
              ? stepPrint[methodName]
              : memory[updater];
              
        arr = convert.toArray(arr);
        
        return arr.concat([next]);
      };

      var stepData = () => {
        if (!isObj || isSpecial) {
          return {};
        }

        for (var i in arguments) {
          delete stepPrint[arguments[i]];
        }

        return stepPrint;
      };

      if(memory._error) {
        handleError(memory, memory._error);
        return;
      }

      if (isVariation) {
        method(memory, specialProp, !peach[methodName]).then(next);
        return;
      }

      if (methodName == "boolean") {
        memory[updater] = stepPrint;
        return next();
      }

      if (typeof method != "function") {
        var data = stepData();

        for (var key in data) {
          var value = data[key],
              def = obj.tip(memory, key);
              
          def.obj[def.prop] = obj.deep(memory, value) || value;
        }

        memory._remember(data);
        return next();
      }

      var args = setupArgs(),
          data = stepData(methodName),
          autoCompletes = method.toString().includesAny("next", "return");

      memory
        ._remember(data)
        ._addTools({ _step: this, next });

      try {
        method.apply(memory, args);
      } catch (error) {
        handleError(memory, error.toString());
        return;
      }

      if (!autoCompletes) {
        next();
      }
    }
  }.init();
}

module.exports = { Peach, convert, obj, type };
