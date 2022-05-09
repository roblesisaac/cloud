import { convert, getArgNames, getArgs, obj, type } from "./utils.js";
import { Memory } from "./memory.js";
import { globalSteps } from "./globalSteps.js";

function Peach(blueprint) {
  var instruct = blueprint.instruct;

  var natives = {
    _blueprint: obj.copy(blueprint),
    _catch: blueprint.catch ? obj.copy(blueprint.catch) : null,
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

function buildPeach(instructions, peach, peachName) {
  var getSteps = function(args) {
    var stepsArr = convert.toInstruct(instructions, args);
    return buildSteps(stepsArr, peach, peachName);
  };
  
  var peachMethod = function(memory, parentSpecial, peachIsForeign) {
    var _args = arguments;
    
    var getMemory = (_resolve, _rej, _peachName) => {
      var isMemory = obj.deep(memory, "constructor.name") == "Memory";
          
      _resolve = [_resolve];
      
      if(isMemory) {
        memory._resolve = _resolve.concat(memory._resolve);
        
        var argNames = getArgNames(instructions),
            subArgs = argNames.map(argName => memory[argName] || argName);
            
        memory._args.unshift(subArgs);
            
        if(peachIsForeign || memory._args[1]) {
          memory._absorb(peach);
        }
        
        return memory;
      }

      var tools = { _resolve, _rej, _peachName, _args: [_args] },
          userArgs = getArgs(instructions, _args);
          
      return new Memory(peach)._remember(userArgs)._addTools(tools);
    };
    
    return new Promise(function(resolve, reject) {
      var memry = getMemory(resolve, reject, peachName),
          args = memry._args,
          arg = args[1] ? args.shift() : args[0],
          steps = getSteps(arg);
          
      steps.method(memry, null, parentSpecial);
    });
  };

  peachMethod.steps = getSteps;
  peachMethod.step = getStep;

  if (peachName != "run") {
    peach._library.peachs[peachName] = peachMethod;
  }

  obj.assignNative(peach, peachName+"_", function(args) {
    return function(res, next) {
      var { _args, _step } = this,
          { specialProp, peach, methodName } = _step;
          
      _args.unshift(convert.toArray(args));
      
      peachMethod(this, specialProp, peach[methodName]).then(next);
    };
  });
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
          { _catch } = peach;   
      
      var errMessage = {
        error,
        methodName,
        peachName,
        _peachName,
        prev,
        stepPrint
      };
      
      var builtIn = _catch ? _catch[_peachName] || _catch : null;
      
      const handler =  builtIn || _rej;
      
      if (handler && typeof handler == "function") {
        handler.call(memory, errMessage);
        return;
      }

      console.error(errMessage);
      return;
    },
    method: function(memory, rabbitTrail, parentSpecial) {
      var { nextStep, isFinalStep, isSpecial, isVariation, handleError } = this,
          { _resolve, _args } = memory;

      var method = peach[methodName] || peach._steps[methodName] || stepPrint,
          theSpecial = specialProp || parentSpecial,
          updater = theSpecial == "if" ? "_condition" : "_last",
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
          var resolve = rabbitTrail || _resolve.shift();

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
              def = obj.tip(memory, key),
              { item, prop } = def;
              
          item[prop] = obj.deep(memory, value) || value;
        }
        
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

export { Peach, convert, obj, type };
