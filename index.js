var slice = Array.prototype.slice;

function isFunction (obj) {
  return Object.prototype.toString.call(obj) == '[object Function]';
}

function validate (funcs) {
  if (funcs.length < 2)
    throw new Error('Give runnel at least 2 functions to do any work.');

  for (var i = 0; i < funcs.length; i++) {
    if (!isFunction(funcs[i]))
      throw new Error('All arguments passed to runnel need to be a function. Argument at (zero based) position ' + i + ' is not.');
  }
}

function runnel () {
  var funcs = slice.call(arguments);
  validate(funcs);

  var done = funcs.pop()
    , func = funcs.shift()
    , bailed = false
    ;

  function handler (err) {
    // Prevent starting to call down the chain when a func calls back with an err first and without one after
    if (bailed) return;

    var args;

    // Bail if any of the funcs encounters a problem
    if (err) {
      bailed = true;
      args = slice.call(arguments);
      done.apply(this, args);
      return;
    }

    func = funcs.shift();

    if (func) {
      // get args without err
      args = slice.call(arguments, 1);

      // this handler becomes the callback for the current func we are calling
      args.push(handler);

      func.apply(this, args);
    } else {
      args = slice.call(arguments);
      done.apply(this, args);
    }
  }
  
  func.call(this, handler);
}

if (typeof define === 'function' && define.amd) {
  // AMD support
  define(function () { return runnel; });
} else if (typeof window === 'object') {
  // If no AMD and we are in the browser, attach to window
  window.runnel = runnel;
} else if (typeof module === 'object' && typeof module.exports === 'object') {
  // Server side, just export
  module.exports = runnel;
}
