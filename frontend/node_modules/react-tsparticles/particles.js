(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === "object" && typeof module === "object") module.exports = factory(require("tsparticles-engine")); else if (typeof define === "function" && define.amd) define([ "tsparticles-engine" ], factory); else if (typeof exports === "object") exports["Particles"] = factory(require("tsparticles-engine")); else root["Particles"] = factory(root["window"]);
})(this, (__WEBPACK_EXTERNAL_MODULE__818__ => (() => {
  "use strict";
  var __webpack_modules__ = {
    578: (__unused_webpack_module, exports) => {
      var l = Symbol.for("react.element"), n = Symbol.for("react.portal"), p = Symbol.for("react.fragment"), q = Symbol.for("react.strict_mode"), r = Symbol.for("react.profiler"), t = Symbol.for("react.provider"), u = Symbol.for("react.context"), v = Symbol.for("react.forward_ref"), w = Symbol.for("react.suspense"), x = Symbol.for("react.memo"), y = Symbol.for("react.lazy"), z = Symbol.iterator;
      function A(a) {
        if (null === a || "object" !== typeof a) return null;
        a = z && a[z] || a["@@iterator"];
        return "function" === typeof a ? a : null;
      }
      var B = {
        isMounted: function() {
          return !1;
        },
        enqueueForceUpdate: function() {},
        enqueueReplaceState: function() {},
        enqueueSetState: function() {}
      }, C = Object.assign, D = {};
      function E(a, b, e) {
        this.props = a;
        this.context = b;
        this.refs = D;
        this.updater = e || B;
      }
      E.prototype.isReactComponent = {};
      E.prototype.setState = function(a, b) {
        if ("object" !== typeof a && "function" !== typeof a && null != a) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, a, b, "setState");
      };
      E.prototype.forceUpdate = function(a) {
        this.updater.enqueueForceUpdate(this, a, "forceUpdate");
      };
      function F() {}
      F.prototype = E.prototype;
      function G(a, b, e) {
        this.props = a;
        this.context = b;
        this.refs = D;
        this.updater = e || B;
      }
      var H = G.prototype = new F;
      H.constructor = G;
      C(H, E.prototype);
      H.isPureReactComponent = !0;
      var I = Array.isArray, J = Object.prototype.hasOwnProperty, K = {
        current: null
      }, L = {
        key: !0,
        ref: !0,
        __self: !0,
        __source: !0
      };
      function M(a, b, e) {
        var d, c = {}, k = null, h = null;
        if (null != b) for (d in void 0 !== b.ref && (h = b.ref), void 0 !== b.key && (k = "" + b.key), 
        b) J.call(b, d) && !L.hasOwnProperty(d) && (c[d] = b[d]);
        var g = arguments.length - 2;
        if (1 === g) c.children = e; else if (1 < g) {
          for (var f = Array(g), m = 0; m < g; m++) f[m] = arguments[m + 2];
          c.children = f;
        }
        if (a && a.defaultProps) for (d in g = a.defaultProps, g) void 0 === c[d] && (c[d] = g[d]);
        return {
          $$typeof: l,
          type: a,
          key: k,
          ref: h,
          props: c,
          _owner: K.current
        };
      }
      function N(a, b) {
        return {
          $$typeof: l,
          type: a.type,
          key: b,
          ref: a.ref,
          props: a.props,
          _owner: a._owner
        };
      }
      function O(a) {
        return "object" === typeof a && null !== a && a.$$typeof === l;
      }
      function escape(a) {
        var b = {
          "=": "=0",
          ":": "=2"
        };
        return "$" + a.replace(/[=:]/g, (function(a) {
          return b[a];
        }));
      }
      var P = /\/+/g;
      function Q(a, b) {
        return "object" === typeof a && null !== a && null != a.key ? escape("" + a.key) : b.toString(36);
      }
      function R(a, b, e, d, c) {
        var k = typeof a;
        if ("undefined" === k || "boolean" === k) a = null;
        var h = !1;
        if (null === a) h = !0; else switch (k) {
         case "string":
         case "number":
          h = !0;
          break;

         case "object":
          switch (a.$$typeof) {
           case l:
           case n:
            h = !0;
          }
        }
        if (h) return h = a, c = c(h), a = "" === d ? "." + Q(h, 0) : d, I(c) ? (e = "", 
        null != a && (e = a.replace(P, "$&/") + "/"), R(c, b, e, "", (function(a) {
          return a;
        }))) : null != c && (O(c) && (c = N(c, e + (!c.key || h && h.key === c.key ? "" : ("" + c.key).replace(P, "$&/") + "/") + a)), 
        b.push(c)), 1;
        h = 0;
        d = "" === d ? "." : d + ":";
        if (I(a)) for (var g = 0; g < a.length; g++) {
          k = a[g];
          var f = d + Q(k, g);
          h += R(k, b, e, f, c);
        } else if (f = A(a), "function" === typeof f) for (a = f.call(a), g = 0; !(k = a.next()).done; ) k = k.value, 
        f = d + Q(k, g++), h += R(k, b, e, f, c); else if ("object" === k) throw b = String(a), 
        Error("Objects are not valid as a React child (found: " + ("[object Object]" === b ? "object with keys {" + Object.keys(a).join(", ") + "}" : b) + "). If you meant to render a collection of children, use an array instead.");
        return h;
      }
      function S(a, b, e) {
        if (null == a) return a;
        var d = [], c = 0;
        R(a, d, "", "", (function(a) {
          return b.call(e, a, c++);
        }));
        return d;
      }
      function T(a) {
        if (-1 === a._status) {
          var b = a._result;
          b = b();
          b.then((function(b) {
            if (0 === a._status || -1 === a._status) a._status = 1, a._result = b;
          }), (function(b) {
            if (0 === a._status || -1 === a._status) a._status = 2, a._result = b;
          }));
          -1 === a._status && (a._status = 0, a._result = b);
        }
        if (1 === a._status) return a._result.default;
        throw a._result;
      }
      var U = {
        current: null
      }, V = {
        transition: null
      }, W = {
        ReactCurrentDispatcher: U,
        ReactCurrentBatchConfig: V,
        ReactCurrentOwner: K
      };
      exports.Children = {
        map: S,
        forEach: function(a, b, e) {
          S(a, (function() {
            b.apply(this, arguments);
          }), e);
        },
        count: function(a) {
          var b = 0;
          S(a, (function() {
            b++;
          }));
          return b;
        },
        toArray: function(a) {
          return S(a, (function(a) {
            return a;
          })) || [];
        },
        only: function(a) {
          if (!O(a)) throw Error("React.Children.only expected to receive a single React element child.");
          return a;
        }
      };
      exports.Component = E;
      exports.Fragment = p;
      exports.Profiler = r;
      exports.PureComponent = G;
      exports.StrictMode = q;
      exports.Suspense = w;
      exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W;
      exports.cloneElement = function(a, b, e) {
        if (null === a || void 0 === a) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
        var d = C({}, a.props), c = a.key, k = a.ref, h = a._owner;
        if (null != b) {
          void 0 !== b.ref && (k = b.ref, h = K.current);
          void 0 !== b.key && (c = "" + b.key);
          if (a.type && a.type.defaultProps) var g = a.type.defaultProps;
          for (f in b) J.call(b, f) && !L.hasOwnProperty(f) && (d[f] = void 0 === b[f] && void 0 !== g ? g[f] : b[f]);
        }
        var f = arguments.length - 2;
        if (1 === f) d.children = e; else if (1 < f) {
          g = Array(f);
          for (var m = 0; m < f; m++) g[m] = arguments[m + 2];
          d.children = g;
        }
        return {
          $$typeof: l,
          type: a.type,
          key: c,
          ref: k,
          props: d,
          _owner: h
        };
      };
      exports.createContext = function(a) {
        a = {
          $$typeof: u,
          _currentValue: a,
          _currentValue2: a,
          _threadCount: 0,
          Provider: null,
          Consumer: null,
          _defaultValue: null,
          _globalName: null
        };
        a.Provider = {
          $$typeof: t,
          _context: a
        };
        return a.Consumer = a;
      };
      exports.createElement = M;
      exports.createFactory = function(a) {
        var b = M.bind(null, a);
        b.type = a;
        return b;
      };
      exports.createRef = function() {
        return {
          current: null
        };
      };
      exports.forwardRef = function(a) {
        return {
          $$typeof: v,
          render: a
        };
      };
      exports.isValidElement = O;
      exports.lazy = function(a) {
        return {
          $$typeof: y,
          _payload: {
            _status: -1,
            _result: a
          },
          _init: T
        };
      };
      exports.memo = function(a, b) {
        return {
          $$typeof: x,
          type: a,
          compare: void 0 === b ? null : b
        };
      };
      exports.startTransition = function(a) {
        var b = V.transition;
        V.transition = {};
        try {
          a();
        } finally {
          V.transition = b;
        }
      };
      exports.unstable_act = function() {
        throw Error("act(...) is not supported in production builds of React.");
      };
      exports.useCallback = function(a, b) {
        return U.current.useCallback(a, b);
      };
      exports.useContext = function(a) {
        return U.current.useContext(a);
      };
      exports.useDebugValue = function() {};
      exports.useDeferredValue = function(a) {
        return U.current.useDeferredValue(a);
      };
      exports.useEffect = function(a, b) {
        return U.current.useEffect(a, b);
      };
      exports.useId = function() {
        return U.current.useId();
      };
      exports.useImperativeHandle = function(a, b, e) {
        return U.current.useImperativeHandle(a, b, e);
      };
      exports.useInsertionEffect = function(a, b) {
        return U.current.useInsertionEffect(a, b);
      };
      exports.useLayoutEffect = function(a, b) {
        return U.current.useLayoutEffect(a, b);
      };
      exports.useMemo = function(a, b) {
        return U.current.useMemo(a, b);
      };
      exports.useReducer = function(a, b, e) {
        return U.current.useReducer(a, b, e);
      };
      exports.useRef = function(a) {
        return U.current.useRef(a);
      };
      exports.useState = function(a) {
        return U.current.useState(a);
      };
      exports.useSyncExternalStore = function(a, b, e) {
        return U.current.useSyncExternalStore(a, b, e);
      };
      exports.useTransition = function() {
        return U.current.useTransition();
      };
      exports.version = "18.2.0";
    },
    983: (module, __unused_webpack_exports, __webpack_require__) => {
      if (true) {
        module.exports = __webpack_require__(578);
      } else {}
    },
    818: module => {
      module.exports = __WEBPACK_EXTERNAL_MODULE__818__;
    }
  };
  var __webpack_module_cache__ = {};
  function __webpack_require__(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    var module = __webpack_module_cache__[moduleId] = {
      exports: {}
    };
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    return module.exports;
  }
  (() => {
    __webpack_require__.d = (exports, definition) => {
      for (var key in definition) {
        if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key]
          });
        }
      }
    };
  })();
  (() => {
    __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
  })();
  (() => {
    __webpack_require__.r = exports => {
      if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, {
          value: "Module"
        });
      }
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
    };
  })();
  var __webpack_exports__ = {};
  (() => {
    __webpack_require__.r(__webpack_exports__);
    __webpack_require__.d(__webpack_exports__, {
      Particles: () => browser_Particles,
      default: () => browser
    });
    var react = __webpack_require__(983);
    var external_commonjs_tsparticles_engine_commonjs2_tsparticles_engine_amd_tsparticles_engine_root_window_ = __webpack_require__(818);
    const isObject = val => typeof val === "object" && val !== null;
    function deepCompare(obj1, obj2, excludeKeyFn = (() => false)) {
      if (!isObject(obj1) || !isObject(obj2)) {
        return obj1 === obj2;
      }
      const keys1 = Object.keys(obj1).filter((key => !excludeKeyFn(key))), keys2 = Object.keys(obj2).filter((key => !excludeKeyFn(key)));
      if (keys1.length !== keys2.length) {
        return false;
      }
      for (const key of keys1) {
        const value1 = obj1[key], value2 = obj2[key];
        if (isObject(value1) && isObject(value2)) {
          if (value1 === obj2 && value2 === obj1) {
            continue;
          }
          if (!deepCompare(value1, value2, excludeKeyFn)) {
            return false;
          }
        } else if (Array.isArray(value1) && Array.isArray(value2)) {
          if (!deepCompareArrays(value1, value2, excludeKeyFn)) {
            return false;
          }
        } else if (value1 !== value2) {
          return false;
        }
      }
      return true;
    }
    function deepCompareArrays(arr1, arr2, excludeKeyFn) {
      if (arr1.length !== arr2.length) {
        return false;
      }
      for (let i = 0; i < arr1.length; i++) {
        const val1 = arr1[i], val2 = arr2[i];
        if (Array.isArray(val1) && Array.isArray(val2)) {
          if (!deepCompareArrays(val1, val2, excludeKeyFn)) {
            return false;
          }
        } else if (isObject(val1) && isObject(val2)) {
          if (!deepCompare(val1, val2, excludeKeyFn)) {
            return false;
          }
        } else if (val1 !== val2) {
          return false;
        }
      }
      return true;
    }
    const defaultId = "tsparticles";
    class Particles extends react.Component {
      constructor(props) {
        super(props);
        this.state = {
          init: false,
          library: undefined
        };
      }
      destroy() {
        if (!this.state.library) {
          return;
        }
        this.state.library.destroy();
        this.setState({
          library: undefined
        });
      }
      shouldComponentUpdate(nextProps) {
        const nextOptions = nextProps.options ?? nextProps.params, currentOptions = this.props.options ?? this.props.params;
        return nextProps.url !== this.props.url || nextProps.id !== this.props.id || nextProps.canvasClassName !== this.props.canvasClassName || nextProps.className !== this.props.className || nextProps.height !== this.props.height || nextProps.width !== this.props.width || !deepCompare(nextProps.style, this.props.style) || nextProps.init !== this.props.init || nextProps.loaded !== this.props.loaded || !deepCompare(nextOptions, currentOptions, (key => key.startsWith("_")));
      }
      componentDidUpdate() {
        this.refresh();
      }
      forceUpdate() {
        this.refresh().then((() => {
          super.forceUpdate();
        }));
      }
      componentDidMount() {
        (async () => {
          if (this.props.init) {
            await this.props.init(external_commonjs_tsparticles_engine_commonjs2_tsparticles_engine_amd_tsparticles_engine_root_window_.tsParticles);
          }
          this.setState({
            init: true
          }, (async () => {
            await this.loadParticles();
          }));
        })();
      }
      componentWillUnmount() {
        this.destroy();
      }
      render() {
        const {width, height, className, canvasClassName, id} = this.props;
        return react.createElement("div", {
          className,
          id
        }, react.createElement("canvas", {
          className: canvasClassName,
          style: {
            ...this.props.style,
            width,
            height
          }
        }));
      }
      async refresh() {
        this.destroy();
        await this.loadParticles();
      }
      async loadParticles() {
        if (!this.state.init) {
          return;
        }
        const id = this.props.id ?? Particles.defaultProps.id ?? defaultId, container = await external_commonjs_tsparticles_engine_commonjs2_tsparticles_engine_amd_tsparticles_engine_root_window_.tsParticles.load({
          url: this.props.url,
          id,
          options: this.props.options ?? this.props.params
        });
        if (this.props.container) {
          this.props.container.current = container;
        }
        this.setState({
          library: container
        });
        if (this.props.loaded) {
          await this.props.loaded(container);
        }
      }
    }
    Particles.defaultProps = {
      width: "100%",
      height: "100%",
      options: {},
      style: {},
      url: undefined,
      id: defaultId
    };
    const browser_Particles = Particles;
    const browser = browser_Particles;
  })();
  return __webpack_exports__;
})()));