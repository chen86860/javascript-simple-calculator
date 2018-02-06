// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }
      
      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module;

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module() {
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({10:[function(require,module,exports) {
var bundleURL = null;
function getBundleURLCached() {
  if (!bundleURL) {
    bundleURL = getBundleURL();
  }

  return bundleURL;
}

function getBundleURL() {
  // Attempt to find the URL of the current script and use that as the base URL
  try {
    throw new Error;
  } catch (err) {
    var matches = ('' + err.stack).match(/(https?|file|ftp):\/\/[^)\n]+/g);
    if (matches) {
      return getBaseURL(matches[0]);
    }
  }

  return '/';
}

function getBaseURL(url) {
  return ('' + url).replace(/^((?:https?|file|ftp):\/\/.+)\/[^/]+$/, '$1') + '/';
}

exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;

},{}],8:[function(require,module,exports) {
var bundle = require('./bundle-url');

function updateLink(link) {
  var newLink = link.cloneNode();
  newLink.onload = function () {
    link.remove();
  };
  newLink.href = link.href.split('?')[0] + '?' + Date.now();
  link.parentNode.insertBefore(newLink, link.nextSibling);
}

var cssTimeout = null;
function reloadCSS() {
  if (cssTimeout) {
    return;
  }

  cssTimeout = setTimeout(function () {
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      if (bundle.getBaseURL(links[i].href) === bundle.getBundleURL()) {
        updateLink(links[i]);
      }
    }

    cssTimeout = null;
  }, 50);
}

module.exports = reloadCSS;

},{"./bundle-url":10}],6:[function(require,module,exports) {

        var reloadCSS = require('_css_loader');
        module.hot.dispose(reloadCSS);
        module.hot.accept(reloadCSS);
      
},{"_css_loader":8}],4:[function(require,module,exports) {
'use strict';

require('./index.scss');

let disabledOP = ['=', 'C', 'del', '%'],
    displayBox = document.querySelector('.display'),
    btnList = document.querySelectorAll('.calc input[type="button"]'),
    computedBtn = document.querySelector('.computed'),
    clearBtn = document.querySelector('.clear'),
    delBtn = document.querySelector('.del'),
    operas = '',
    isComputed = false;

// calc the publicity
// 12 3 4 + * 6 - 8 2 / +
// => 78
const calc = publicity => {
  let sum = 0;
  let stack = publicity,
      opList = [['+', '-'], ['*', '/']],
      getOpPriority = op => {
    let i = -1;
    for (let [index, value] of opList.entries()) {
      if (Array.isArray(value) && value.indexOf(op) > -1 || value === op) {
        i = index;
        break;
      }
    }
    return i;
  };

  let tmp = [];
  while (stack.length !== 0) {
    let item = stack.shift();
    if (getOpPriority(item) > -1) {
      let op1 = tmp.pop();
      let op2 = tmp.pop();
      let result = 0;
      switch (item) {
        case '+':
          result = op2 + op1;
          break;
        case '-':
          result = op2 - op1;
          break;
        case '*':
          result = op2 * op1;
          break;
        case '/':
          result = op2 / op1;
        default:
          break;
      }
      tmp.push(result);
    } else {
      tmp.push(parseFloat(item));
    }
  }
  return tmp[0];
};

// mid notation to last notation
// ['(', '12',+', '4', ')', '*', '5', '-', '6', '+', '8', '/', '2'] 
// => ['12', '3', '4', '+' ,'*', '6' ,'-', '8', '2' ,'/' ,'+']
const notation = list => {
  let output = [],
      opStack = [],
      opList = [['+', '-'], ['*', '/']],
      getOpPriority = op => {
    let i = -1;
    for (let [index, value] of opList.entries()) {
      if (Array.isArray(value) && value.indexOf(op) > -1 || value === op) {
        i = index;
        break;
      }
    }
    return i;
  };

  if (!Array.isArray(list) || list.length === 0) return;
  list.forEach(item => {
    if (/\d|\./.test(item)) {
      output.push(item);
    } else {
      if (getOpPriority(item) > -1) {
        if (opStack.length === 0 || getOpPriority(item) > getOpPriority(opStack[opStack.length - 1])) {
          opStack.push(item);
        } else {
          while (true) {
            let popOP = opStack.pop();
            output.push(popOP);
            opStack.push(item);
            if (opStack.length === 0 || getOpPriority(item) <= getOpPriority(opStack[opStack.length - 1])) {
              break;
            }
          }
        }
      } else {
        if (item === ')') {
          while (true) {
            let popOP = opStack.pop();
            if (popOP !== '(') {
              output.push(popOP);
            } else {
              break;
            }
          }
        } else {
          opStack.push(item);
        }
      }
    }
  });

  while (opStack.length != 0) {
    output.push(opStack.pop());
  }

  return output;
};

// combine normalNumbers
// ['(', '1', '2' ,+', '4', ')', '*', '5', '-', '6', '+', '8', '/', '2']
// =>   ['(', '12',+', '4', ')', '*', '5', '-', '6', '+', '8', '/', '2']
const normalNumbers = list => {
  return list.match(/[^\d()]+|[\d.]+/g);
};

// numbers listener
Array.from(btnList).forEach(item => {
  item.addEventListener('click', e => {
    handlerNumber(e);
  });
});

// handlerNumber
const handlerNumber = event => {
  if (isComputed) {
    displayBox.innerHTML = '';
    isComputed = false;
  }
  let op = event.target.value;
  if (disabledOP.includes(op)) return;
  displayBox.innerHTML += op;
  operas += op;
};

// computedBtn listener
computedBtn.addEventListener('click', e => {
  handleComputed();
});

const handleComputed = () => {
  displayBox.innerHTML = calc(notation(normalNumbers(operas)));
  isComputed = true;
  operas = '';
};

// clear
clearBtn.addEventListener('click', e => {
  handleClear();
});

const handleClear = () => {
  displayBox.innerHTML = operas = '';
};

// del
delBtn.addEventListener('click', e => {
  displayBox.innerHTML = displayBox.innerHTML.substring(0, displayBox.innerHTML.length - 1);
  operas = operas.substring(1, operas.length - 1);
});
},{"./index.scss":6}],11:[function(require,module,exports) {

var global = (1, eval)('this');
var OldModule = module.bundle.Module;
function Module() {
  OldModule.call(this);
  this.hot = {
    accept: function (fn) {
      this._acceptCallback = fn || function () {};
    },
    dispose: function (fn) {
      this._disposeCallback = fn;
    }
  };
}

module.bundle.Module = Module;

if (!module.bundle.parent && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var ws = new WebSocket('ws://' + hostname + ':' + '63331' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.require, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.require, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + 'data.error.stack');
    }
  };
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  if (cached && cached.hot._disposeCallback) {
    cached.hot._disposeCallback();
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallback) {
    cached.hot._acceptCallback();
    return true;
  }

  return getParents(global.require, id).some(function (id) {
    return hmrAccept(global.require, id);
  });
}
},{}]},{},[11,4])
//# sourceMappingURL=/dist/javascript-simple-calculator.map