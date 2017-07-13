function(f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f()
    } else if (typeof define === "function" && define.amd) {
        define([], f)
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window
        } else if (typeof global !== "undefined") {
            g = global
        } else if (typeof self !== "undefined") {
            g = self
        } else {
            g = this
        }
        g.functionPlot = f()
    }
})(function() {
    var define, module, exports;
    return function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f
                }
                var l = n[o] = {
                    exports: {}
                };
                t[o][0].call(l.exports, function(e) {
                    var n = t[o][1][e];
                    return s(n ? n : e)
                }, l, l.exports, e, t, n, r)
            }
            return n[o].exports
        }
        var i = typeof require == "function" && require;
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s
    }({
        1: [function(require, module, exports) {
            function EventEmitter() {
                this._events = this._events || {};
                this._maxListeners = this._maxListeners || undefined
            }
            module.exports = EventEmitter;
            EventEmitter.EventEmitter = EventEmitter;
            EventEmitter.prototype._events = undefined;
            EventEmitter.prototype._maxListeners = undefined;
            EventEmitter.defaultMaxListeners = 10;
            EventEmitter.prototype.setMaxListeners = function(n) {
                if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError("n must be a positive number");
                this._maxListeners = n;
                return this
            };
            EventEmitter.prototype.emit = function(type) {
                var er, handler, len, args, i, listeners;
                if (!this._events) this._events = {};
                if (type === "error") {
                    if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
                        er = arguments[1];
                        if (er instanceof Error) {
                            throw er
                        }
                        throw TypeError('Uncaught, unspecified "error" event.')
                    }
                }
                handler = this._events[type];
                if (isUndefined(handler)) return false;
                if (isFunction(handler)) {
                    switch (arguments.length) {
                        case 1:
                            handler.call(this);
                            break;
                        case 2:
                            handler.call(this, arguments[1]);
                            break;
                        case 3:
                            handler.call(this, arguments[1], arguments[2]);
                            break;
                        default:
                            args = Array.prototype.slice.call(arguments, 1);
                            handler.apply(this, args)
                    }
                } else if (isObject(handler)) {
                    args = Array.prototype.slice.call(arguments, 1);
                    listeners = handler.slice();
                    len = listeners.length;
                    for (i = 0; i < len; i++) listeners[i].apply(this, args)
                }
                return true
            };
            EventEmitter.prototype.addListener = function(type, listener) {
                var m;
                if (!isFunction(listener)) throw TypeError("listener must be a function");
                if (!this._events) this._events = {};
                if (this._events.newListener) this.emit("newListener", type, isFunction(listener.listener) ? listener.listener : listener);
                if (!this._events[type]) this._events[type] = listener;
                else if (isObject(this._events[type])) this._events[type].push(listener);
                else this._events[type] = [this._events[type], listener];
                if (isObject(this._events[type]) && !this._events[type].warned) {
                    if (!isUndefined(this._maxListeners)) {
                        m = this._maxListeners
                    } else {
                        m = EventEmitter.defaultMaxListeners
                    }
                    if (m && m > 0 && this._events[type].length > m) {
                        this._events[type].warned = true;
                        console.error("(node) warning: possible EventEmitter memory " + "leak detected. %d listeners added. " + "Use emitter.setMaxListeners() to increase limit.", this._events[type].length);
                        if (typeof console.trace === "function") {
                            console.trace()
                        }
                    }
                }
                return this
            };
            EventEmitter.prototype.on = EventEmitter.prototype.addListener;
            EventEmitter.prototype.once = function(type, listener) {
                if (!isFunction(listener)) throw TypeError("listener must be a function");
                var fired = false;

                function g() {
                    this.removeListener(type, g);
                    if (!fired) {
                        fired = true;
                        listener.apply(this, arguments)
                    }
                }
                g.listener = listener;
                this.on(type, g);
                return this
            };
            EventEmitter.prototype.removeListener = function(type, listener) {
                var list, position, length, i;
                if (!isFunction(listener)) throw TypeError("listener must be a function");
                if (!this._events || !this._events[type]) return this;
                list = this._events[type];
                length = list.length;
                position = -1;
                if (list === listener || isFunction(list.listener) && list.listener === listener) {
                    delete this._events[type];
                    if (this._events.removeListener) this.emit("removeListener", type, listener)
                } else if (isObject(list)) {
                    for (i = length; i-- > 0;) {
                        if (list[i] === listener || list[i].listener && list[i].listener === listener) {
                            position = i;
                            break
                        }
                    }
                    if (position < 0) return this;
                    if (list.length === 1) {
                        list.length = 0;
                        delete this._events[type]
                    } else {
                        list.splice(position, 1)
                    }
                    if (this._events.removeListener) this.emit("removeListener", type, listener)
                }
                return this
            };
            EventEmitter.prototype.removeAllListeners = function(type) {
                var key, listeners;
                if (!this._events) return this;
                if (!this._events.removeListener) {
                    if (arguments.length === 0) this._events = {};
                    else if (this._events[type]) delete this._events[type];
                    return this
                }
                if (arguments.length === 0) {
                    for (key in this._events) {
                        if (key === "removeListener") continue;
                        this.removeAllListeners(key)
                    }
                    this.removeAllListeners("removeListener");
                    this._events = {};
                    return this
                }
                listeners = this._events[type];
                if (isFunction(listeners)) {
                    this.removeListener(type, listeners)
                } else if (listeners) {
                    while (listeners.length) this.removeListener(type, listeners[listeners.length - 1])
                }
                delete this._events[type];
                return this
            };
            EventEmitter.prototype.listeners = function(type) {
                var ret;
                if (!this._events || !this._events[type]) ret = [];
                else if (isFunction(this._events[type])) ret = [this._events[type]];
                else ret = this._events[type].slice();
                return ret
            };
            EventEmitter.prototype.listenerCount = function(type) {
                if (this._events) {
                    var evlistener = this._events[type];
                    if (isFunction(evlistener)) return 1;
                    else if (evlistener) return evlistener.length
                }
                return 0
            };
            EventEmitter.listenerCount = function(emitter, type) {
                return emitter.listenerCount(type)
            };

            function isFunction(arg) {
                return typeof arg === "function"
            }

            function isNumber(arg) {
                return typeof arg === "number"
            }

            function isObject(arg) {
                return typeof arg === "object" && arg !== null
            }

            function isUndefined(arg) {
                return arg === void 0
            }
        }, {}],
        2: [function(require, module, exports) {
            var process = module.exports = {};
            var queue = [];
            var draining = false;
            var currentQueue;
            var queueIndex = -1;

            function cleanUpNextTick() {
                draining = false;
                if (currentQueue.length) {
                    queue = currentQueue.concat(queue)
                } else {
                    queueIndex = -1
                }
                if (queue.length) {
                    drainQueue()
                }
            }

            function drainQueue() {
                if (draining) {
                    return
                }
                var timeout = setTimeout(cleanUpNextTick);
                draining = true;
                var len = queue.length;
                while (len) {
                    currentQueue = queue;
                    queue = [];
                    while (++queueIndex < len) {
                        if (currentQueue) {
                            currentQueue[queueIndex].run()
                        }
                    }
                    queueIndex = -1;
                    len = queue.length
                }
                currentQueue = null;
                draining = false;
                clearTimeout(timeout)
            }
            process.nextTick = function(fun) {
                var args = new Array(arguments.length - 1);
                if (arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                        args[i - 1] = arguments[i]
                    }
                }
                queue.push(new Item(fun, args));
                if (queue.length === 1 && !draining) {
                    setTimeout(drainQueue, 0)
                }
            };

            function Item(fun, array) {
                this.fun = fun;
                this.array = array
            }
            Item.prototype.run = function() {
                this.fun.apply(null, this.array)
            };
            process.title = "browser";
            process.browser = true;
            process.env = {};
            process.argv = [];
            process.version = "";
            process.versions = {};

            function noop() {}
            process.on = noop;
            process.addListener = noop;
            process.once = noop;
            process.off = noop;
            process.removeListener = noop;
            process.removeAllListeners = noop;
            process.emit = noop;
            process.binding = function(name) {
                throw new Error("process.binding is not supported")
            };
            process.cwd = function() {
                return "/"
            };
            process.chdir = function(dir) {
                throw new Error("process.chdir is not supported")
            };
            process.umask = function() {
                return 0
            }
        }, {}],
        3: [function(require, module, exports) {
            module.exports = require("./lib/")
        }, {
            "./lib/": 16
        }],
        4: [function(require, module, exports) {
            var isObject = require("is-object");
            module.exports = function(d) {
                if (!isObject(d)) {
                    throw Error("datum is not an object")
                }
                if (!d.hasOwnProperty("graphType")) {
                    d.graphType = "interval"
                }
                if (!d.hasOwnProperty("sampler")) {
                    d.sampler = d.graphType !== "interval" ? "builtIn" : "interval"
                }
                if (!d.hasOwnProperty("fnType")) {
                    d.fnType = "linear"
                }
                return d
            }
        }, {
            "is-object": 106
        }],
        5: [function(require, module, exports) {
            "use strict";
            var globals = require("./globals");
            var evalTypeFn = {
                interval: require("./samplers/interval"),
                builtIn: require("./samplers/builtIn")
            };

            function computeEndpoints(chart, d) {
                var range = d.range || [-Infinity, Infinity];
                var scale = chart.meta.xScale;
                var start = Math.max(scale.domain()[0], range[0]);
                var end = Math.min(scale.domain()[1], range[1]);
                return [start, end]
            }

            function evaluate(chart, d) {
                var range = computeEndpoints(chart, d);
                var data;
                var evalFn = evalTypeFn[d.sampler];
                var nSamples = d.nSamples || Math.min(globals.MAX_ITERATIONS, globals.DEFAULT_ITERATIONS || chart.meta.width * 2);
                data = evalFn(chart, d, range, nSamples);
                chart.emit("eval", data, d.index, d.isHelper);
                return data
            }
            module.exports = evaluate
        }, {
            "./globals": 6,
            "./samplers/builtIn": 21,
            "./samplers/interval": 22
        }],
        6: [function(require, module, exports) {
            "use strict";
            var d3 = window.d3;
            var Globals = {
                COLORS: ["steelblue", "red", "#05b378", "orange", "#4040e8", "yellow", "brown", "magenta", "cyan"].map(function(v) {
                    return d3.hsl(v)
                }),
                DEFAULT_WIDTH: 550,
                DEFAULT_HEIGHT: 350,
                TIP_X_EPS: 1
            };
            Globals.DEFAULT_ITERATIONS = null;
            Globals.MAX_ITERATIONS = Globals.DEFAULT_WIDTH * 4;
            module.exports = Globals
        }, {}],
        7: [function(require, module, exports) {
            "use strict";
            module.exports = {
                polyline: require("./polyline"),
                interval: require("./interval"),
                scatter: require("./scatter")
            }
        }, {
            "./interval": 8,
            "./polyline": 9,
            "./scatter": 10
        }],
        8: [function(require, module, exports) {
            "use strict";
            var d3 = window.d3;
            var evaluate = require("../evaluate");
            var utils = require("../utils");
            module.exports = function(chart) {
                var minWidthHeight;
                var xScale = chart.meta.xScale;
                var yScale = chart.meta.yScale;

                function clampRange(vLo, vHi, gLo, gHi) {
                    var hi = Math.min(vHi, gHi);
                    var lo = Math.max(vLo, gLo);
                    if (lo > hi) {
                        return [-minWidthHeight, 0]
                    }
                    return [lo, hi]
                }
                var line = function(points, closed) {
                    var path = "";
                    var minY = yScale.range()[1];
                    var maxY = yScale.range()[0];
                    for (var i = 0, length = points.length; i < length; i += 1) {
                        if (points[i]) {
                            var x = points[i][0];
                            var y = points[i][1];
                            var yLo = y.lo;
                            var yHi = y.hi;
                            if (closed) {
                                yLo = Math.min(yLo, 0);
                                yHi = Math.max(yHi, 0)
                            }
                            var moveX = xScale(x.lo) + points.scaledDx / 2;
                            var viewportY = clampRange(minY, maxY, isFinite(yHi) ? yScale(yHi) : -Infinity, isFinite(yLo) ? yScale(yLo) : Infinity);
                            var vLo = viewportY[0];
                            var vHi = viewportY[1];
                            path += " M " + moveX + " " + vLo;
                            path += " v " + Math.max(vHi - vLo, minWidthHeight)
                        }
                    }
                    return path
                };

                function plotLine(selection) {
                    selection.each(function(d) {
                        var el = plotLine.el = d3.select(this);
                        var index = d.index;
                        var closed = d.closed;
                        var evaluatedData = evaluate(chart, d);
                        var innerSelection = el.selectAll(":scope > path.line").data(evaluatedData);
                        minWidthHeight = Math.max(evaluatedData[0].scaledDx, 1);
                        innerSelection.enter().append("path").attr("class", "line line-" + index).attr("fill", "none");
                        innerSelection.attr("stroke-width", minWidthHeight).attr("stroke", utils.color(d, index)).attr("opacity", closed ? .5 : 1).attr("d", function(d) {
                            return line(d, closed)
                        });
                        innerSelection.exit().remove()
                    })
                }
                return plotLine
            }
        }, {
            "../evaluate": 5,
            "../utils": 24
        }],
        9: [function(require, module, exports) {
            "use strict";
            var d3 = window.d3;
            var evaluate = require("../evaluate");
            var utils = require("../utils");
            module.exports = function(chart) {
                var xScale = chart.meta.xScale;
                var yScale = chart.meta.yScale;
                var line = d3.svg.line().interpolate("linear").x(function(d) {
                    return xScale(d[0])
                }).y(function(d) {
                    return yScale(d[1])
                });
                var area = d3.svg.area().x(function(d) {
                    return xScale(d[0])
                }).y0(yScale(0)).y1(function(d) {
                    return yScale(d[1])
                });

                function plotLine(selection) {
                    selection.each(function(d) {
                        var el = plotLine.el = d3.select(this);
                        var index = d.index;
                        var evaluatedData = evaluate(chart, d);
                        var color = utils.color(d, index);
                        var innerSelection = el.selectAll(":scope > path.line").data(evaluatedData);
                        innerSelection.enter().append("path").attr("class", "line line-" + index).attr("stroke-width", 1).attr("stroke-linecap", "round");
                        innerSelection.each(function() {
                            var path = d3.select(this);
                            var pathD;
                            if (d.closed) {
                                path.attr("fill", color);
                                path.attr("fill-opacity", .3);
                                pathD = area
                            } else {
                                path.attr("fill", "none");
                                pathD = line
                            }
                            path.attr("stroke", color).attr("marker-end", function() {
                                return d.fnType === "vector" ? "url(#" + chart.markerId + ")" : null
                            }).attr("d", pathD)
                        });
                        innerSelection.exit().remove()
                    })
                }
                return plotLine
            }
        }, {
            "../evaluate": 5,
            "../utils": 24
        }],
        10: [function(require, module, exports) {
            "use strict";
            var d3 = window.d3;
            var evaluate = require("../evaluate");
            var utils = require("../utils");
            module.exports = function(chart) {
                var xScale = chart.meta.xScale;
                var yScale = chart.meta.yScale;

                function scatter(selection) {
                    selection.each(function(d) {
                        var i, j;
                        var index = d.index;
                        var color = utils.color(d, index);
                        var evaluatedData = evaluate(chart, d);
                        var joined = [];
                        for (i = 0; i < evaluatedData.length; i += 1) {
                            for (j = 0; j < evaluatedData[i].length; j += 1) {
                                joined.push(evaluatedData[i][j])
                            }
                        }
                        var innerSelection = d3.select(this).selectAll(":scope > circle").data(joined);
                        innerSelection.enter().append("circle");
                        innerSelection.attr("fill", d3.hsl(color.toString()).brighter(1.5)).attr("stroke", color).attr("opacity", .7).attr("r", 1).attr("cx", function(d) {
                            return xScale(d[0])
                        }).attr("cy", function(d) {
                            return yScale(d[1])
                        });
                        innerSelection.exit().remove()
                    })
                }
                return scatter
            }
        }, {
            "../evaluate": 5,
            "../utils": 24
        }],
        11: [function(require, module, exports) {
            "use strict";
            var d3 = window.d3;
            module.exports = function(options) {
                var annotations;
                var xScale = options.owner.meta.xScale;
                var yScale = options.owner.meta.yScale;
                var line = d3.svg.line().x(function(d) {
                    return d[0]
                }).y(function(d) {
                    return d[1]
                });
                annotations = function(parentSelection) {
                    parentSelection.each(function() {
                        var current = d3.select(this);
                        var selection = current.selectAll("g.annotations").data(function(d) {
                            return d.annotations || []
                        });
                        selection.enter().append("g").attr("class", "annotations");
                        var yRange = yScale.range();
                        var xRange = xScale.range();
                        var path = selection.selectAll("path").data(function(d) {
                            if (d.hasOwnProperty("x")) {
                                return [
                                    [
                                        [0, yRange[0]],
                                        [0, yRange[1]]
                                    ]
                                ]
                            } else {
                                return [
                                    [
                                        [xRange[0], 0],
                                        [xRange[1], 0]
                                    ]
                                ]
                            }
                        });
                        path.enter().append("path").attr("stroke", "#eee").attr("d", line);
                        path.exit().remove();
                        var text = selection.selectAll("text").data(function(d) {
                            return [{
                                text: d.text || "",
                                hasX: d.hasOwnProperty("x")
                            }]
                        });
                        text.enter().append("text").attr("y", function(d) {
                            return d.hasX ? 3 : 0
                        }).attr("x", function(d) {
                            return d.hasX ? 0 : 3
                        }).attr("dy", function(d) {
                            return d.hasX ? 5 : -5
                        }).attr("text-anchor", function(d) {
                            return d.hasX ? "end" : ""
                        }).attr("transform", function(d) {
                            return d.hasX ? "rotate(-90)" : ""
                        }).text(function(d) {
                            return d.text
                        });
                        text.exit().remove();
                        selection.attr("transform", function(d) {
                            if (d.hasOwnProperty("x")) {
                                return "translate(" + xScale(d.x) + ", 0)"
                            } else {
                                return "translate(0, " + yScale(d.y) + ")"
                            }
                        });
                        selection.exit().remove()
                    })
                };
                return annotations
            }
        }, {}],
        12: [function(require, module, exports) {
            "use strict";
            var d3 = window.d3;
            var builtInEvaluator = require("./eval").builtIn;
            var polyline = require("../graph-types/polyline");
            var datumDefaults = require("../datum-defaults");
            module.exports = function(chart) {
                var derivativeDatum = datumDefaults({
                    skipTip: true,
                    nSamples: 2,
                    graphType: "polyline"
                });
                var derivative;

                function computeLine(d) {
                    if (!d.derivative) {
                        return []
                    }
                    var x0 = typeof d.derivative.x0 === "number" ? d.derivative.x0 : Infinity;
                    derivativeDatum.index = d.index;
                    derivativeDatum.scope = {
                        m: builtInEvaluator(d.derivative, "fn", {
                            x: x0
                        }),
                        x0: x0,
                        y0: builtInEvaluator(d, "fn", {
                            x: x0
                        })
                    };
                    derivativeDatum.fn = "m * (x - x0) + y0";
                    return [derivativeDatum]
                }

                function checkAutoUpdate(d) {
                    var self = this;
                    if (!d.derivative) {
                        return
                    }
                    if (d.derivative.updateOnMouseMove && !d.derivative.$$mouseListener) {
                        d.derivative.$$mouseListener = function(x0) {
                            d.derivative.x0 = x0;
                            derivative(self)
                        };
                        chart.on("tip:update", d.derivative.$$mouseListener)
                    }
                }
                derivative = function(selection) {
                    selection.each(function(d) {
                        var el = d3.select(this);
                        var data = computeLine.call(selection, d);
                        checkAutoUpdate.call(selection, d);
                        var innerSelection = el.selectAll("g.derivative").data(data);
                        innerSelection.enter().append("g").attr("class", "derivative");
                        innerSelection.call(polyline(chart));
                        innerSelection.selectAll("path").attr("opacity", .5);
                        innerSelection.exit().remove()
                    })
                };
                return derivative
            }
        }, {
            "../datum-defaults": 4,
            "../graph-types/polyline": 9,
            "./eval": 13
        }],
        13: [function(require, module, exports) {
            "use strict";
            var samplers = {
                interval: require("interval-arithmetic-eval"),
                builtIn: require("built-in-math-eval")
            };
            var extend = require("extend");
            window.math && (samplers.builtIn = window.math.compile);

            function generateEvaluator(samplerName) {
                function doCompile(expression) {
                    if (typeof expression === "string") {
                        var compile = samplers[samplerName];
                        return compile(expression)
                    } else if (typeof expression === "function") {
                        return {
                            eval: expression
                        }
                    } else {
                        throw Error("expression must be a string or a function")
                    }
                }

                function compileIfPossible(meta, property) {
                    var expression = meta[property];
                    var hiddenProperty = samplerName + "_Expression_" + property;
                    var hiddenCompiled = samplerName + "_Compiled_" + property;
                    if (expression !== meta[hiddenProperty]) {
                        meta[hiddenProperty] = expression;
                        meta[hiddenCompiled] = doCompile(expression)
                    }
                }

                function getCompiledExpression(meta, property) {
                    return meta[samplerName + "_Compiled_" + property]
                }

                function evaluate(meta, property, variables) {
                    compileIfPossible(meta, property);
                    return getCompiledExpression(meta, property).eval(extend({}, meta.scope || {}, variables))
                }
                return evaluate
            }
            module.exports.builtIn = generateEvaluator("builtIn");
            module.exports.interval = generateEvaluator("interval")
        }, {
            "built-in-math-eval": 25,
            extend: 58,
            "interval-arithmetic-eval": 60
        }],
        14: [function(require, module, exports) {
            "use strict";
            var d3 = window.d3;
            var derivative = require("./derivative");
            var secant = require("./secant");
            module.exports = function(chart) {
                function helper(selection) {
                    selection.each(function() {
                        var el = d3.select(this);
                        el.call(derivative(chart));
                        el.call(secant(chart))
                    })
                }
                return helper
            }
        }, {
            "./derivative": 12,
            "./secant": 15
        }],
        15: [function(require, module, exports) {
            "use strict";
            var d3 = window.d3;
            var extend = require("extend");
            var builtInEvaluator = require("./eval").builtIn;
            var datumDefaults = require("../datum-defaults");
            var polyline = require("../graph-types/polyline");
            module.exports = function(chart) {
                var secantDefaults = datumDefaults({
                    isHelper: true,
                    skipTip: true,
                    nSamples: 2,
                    graphType: "polyline"
                });
                var secant;

                function computeSlope(scope) {
                    scope.m = (scope.y1 - scope.y0) / (scope.x1 - scope.x0)
                }

                function updateLine(d, secant) {
                    if (!secant.hasOwnProperty("x0")) {
                        throw Error("secant must have the property `x0` defined")
                    }
                    secant.scope = secant.scope || {};
                    var x0 = secant.x0;
                    var x1 = typeof secant.x1 === "number" ? secant.x1 : Infinity;
                    extend(secant.scope, {
                        x0: x0,
                        x1: x1,
                        y0: builtInEvaluator(d, "fn", {
                            x: x0
                        }),
                        y1: builtInEvaluator(d, "fn", {
                            x: x1
                        })
                    });
                    computeSlope(secant.scope)
                }

                function setFn(d, secant) {
                    updateLine(d, secant);
                    secant.fn = "m * (x - x0) + y0"
                }

                function setMouseListener(d, secantObject) {
                    var self = this;
                    if (secantObject.updateOnMouseMove && !secantObject.$$mouseListener) {
                        secantObject.$$mouseListener = function(x1) {
                            secantObject.x1 = x1;
                            updateLine(d, secantObject);
                            secant(self)
                        };
                        chart.on("tip:update", secantObject.$$mouseListener)
                    }
                }

                function computeLines(d) {
                    var self = this;
                    var data = [];
                    d.secants = d.secants || [];
                    for (var i = 0; i < d.secants.length; i += 1) {
                        var secant = d.secants[i] = extend({}, secantDefaults, d.secants[i]);
                        secant.index = d.index;
                        if (!secant.fn) {
                            setFn.call(self, d, secant);
                            setMouseListener.call(self, d, secant)
                        }
                        data.push(secant)
                    }
                    return data
                }
                secant = function(selection) {
                    selection.each(function(d) {
                        var el = d3.select(this);
                        var data = computeLines.call(selection, d);
                        var innerSelection = el.selectAll("g.secant").data(data);
                        innerSelection.enter().append("g").attr("class", "secant");
                        innerSelection.call(polyline(chart));
                        innerSelection.selectAll("path").attr("opacity", .5);
                        innerSelection.exit().remove()
                    })
                };
                return secant
            }
        }, {
            "../datum-defaults": 4,
            "../graph-types/polyline": 9,
            "./eval": 13,
            extend: 58
        }],
        16: [function(require, module, exports) {
            "use strict";
            require("./polyfills");
            var d3 = window.d3;
            var events = require("events");
            var extend = require("extend");
            var mousetip = require("./tip");
            var helpers = require("./helpers/");
            var annotations = require("./helpers/annotations");
            var datumDefaults = require("./datum-defaults");
            var globals;
            var graphTypes;
            var cache = [];
            module.exports = function(options) {
                options = options || {};
                options.data = options.data || [];
                var width, height;
                var margin;
                var zoomBehavior;
                var xScale, yScale;
                var line = d3.svg.line().x(function(d) {
                    return xScale(d[0])
                }).y(function(d) {
                    return yScale(d[1])
                });

                function Chart() {
                    var n = Math.random();
                    var letter = String.fromCharCode(Math.floor(n * 26) + 97);
                    this.id = options.id = letter + n.toString(16).substr(2);
                    this.linkedGraphs = [this];
                    this.options = options;
                    cache[this.id] = this;
                    this.setUpEventListeners()
                }
                Chart.prototype = Object.create(events.prototype);
                Chart.prototype.build = function() {
                    this.internalVars();
                    this.drawGraphWrapper();
                    return this
                };
                Chart.prototype.updateScaleAxes = function() {
                    var xDomain = this.meta.xDomain;
                    var yDomain = this.meta.yDomain;
                    var integerFormat = d3.format("s");
                    var format = function(scale) {
                        return function(d) {
                            var decimalFormat = scale.tickFormat(10);
                            var isInteger = d === +d && d === (d | 0);
                            return isInteger ? integerFormat(d) : decimalFormat(d)
                        }
                    };
                    xScale = this.meta.xScale = d3.scale.linear().domain(xDomain).range([0, width]);
                    yScale = this.meta.yScale = d3.scale.linear().domain(yDomain).range([height, 0]);
                    this.meta.xAxis = d3.svg.axis().scale(xScale).tickSize(options.grid ? -height : 0).tickFormat(format(xScale)).orient("bottom");
                    this.meta.yAxis = d3.svg.axis().scale(yScale).tickSize(options.grid ? -width : 0).tickFormat(format(yScale)).orient("left")
                };
                Chart.prototype.internalVars = function() {
                    this.meta = {};
                    margin = this.meta.margin = {
                        left: 30,
                        right: 30,
                        top: 20,
                        bottom: 20
                    };
                    if (options.title) {
                        this.meta.margin.top = 40
                    }
                    zoomBehavior = this.meta.zoomBehavior = d3.behavior.zoom();
                    width = this.meta.width = (options.width || globals.DEFAULT_WIDTH) - margin.left - margin.right;
                    height = this.meta.height = (options.height || globals.DEFAULT_HEIGHT) - margin.top - margin.bottom;

                    function computeYScale(xScale) {
                        var xDiff = xScale[1] - xScale[0];
                        return height * xDiff / width
                    }
                    var xLimit = 12;
                    var xDomain = this.meta.xDomain = options.xDomain || [-xLimit / 2, xLimit / 2];
                    var yLimit = computeYScale(xDomain);
                    var yDomain = this.meta.yDomain = options.yDomain || [-yLimit / 2, yLimit / 2];
                    if (xDomain[0] >= xDomain[1]) {
                        throw Error("the pair defining the x-domain is inverted")
                    }
                    if (yDomain[0] >= yDomain[1]) {
                        throw Error("the pair defining the y-domain is inverted")
                    }
                    this.updateScaleAxes()
                };
                Chart.prototype.drawGraphWrapper = function() {
                    var root = this.root = d3.select(options.target).selectAll("svg").data([options]);
                    this.root.enter = root.enter().append("svg").attr("class", "function-plot").attr("font-size", this.getFontSize());
                    root.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);
                    this.buildTitle();
                    this.buildLegend();
                    this.buildCanvas();
                    this.buildClip();
                    this.buildAxis();
                    this.buildAxisLabel();
                    this.draw();
                    var tip = this.tip = mousetip(extend(options.tip, {
                        owner: this
                    }));
                    this.canvas.call(tip);
                    this.buildZoomHelper();
                    this.setUpPlugins()
                };
                Chart.prototype.buildTitle = function() {
                    var selection = this.root.selectAll("text.title").data(function(d) {
                        return [d.title].filter(Boolean)
                    });
                    selection.enter().append("text").attr("class", "title").attr("y", margin.top / 2).attr("x", margin.left + width / 2).attr("font-size", 25).attr("text-anchor", "middle").attr("alignment-baseline", "middle").text(options.title);
                    selection.exit().remove()
                };
                Chart.prototype.buildLegend = function() {
                    this.root.enter.append("text").attr("class", "top-right-legend").attr("text-anchor", "end");
                    this.root.select(".top-right-legend").attr("y", margin.top / 2).attr("x", width + margin.left)
                };
                Chart.prototype.buildCanvas = function() {
                    var self = this;
                    this.meta.zoomBehavior.x(xScale).y(yScale).on("zoom", function onZoom() {
                        self.emit("all:zoom", xScale, yScale)
                    });
                    var canvas = this.canvas = this.root.selectAll(".canvas").data(function(d) {
                        return [d]
                    });
                    this.canvas.enter = canvas.enter().append("g").attr("class", "canvas")
                };
                Chart.prototype.buildClip = function() {
                    var id = this.id;
                    var defs = this.canvas.enter.append("defs");
                    defs.append("clipPath").attr("id", "function-plot-clip-" + id).append("rect").attr("class", "clip static-clip");
                    this.canvas.selectAll(".clip").attr("width", width).attr("height", height);
                    this.markerId = this.id + "-marker";
                    defs.append("clipPath").append("marker").attr("id", this.markerId).attr("viewBox", "0 -5 10 10").attr("refX", 10).attr("markerWidth", 5).attr("markerHeight", 5).attr("orient", "auto").append("svg:path").attr("d", "M0,-5L10,0L0,5L0,0").attr("stroke-width", "0px").attr("fill-opacity", 1).attr("fill", "#777")
                };
                Chart.prototype.buildAxis = function() {
                    var canvasEnter = this.canvas.enter;
                    canvasEnter.append("g").attr("class", "x axis");
                    canvasEnter.append("g").attr("class", "y axis");
                    this.canvas.select(".x.axis").attr("transform", "translate(0," + height + ")").call(this.meta.xAxis);
                    this.canvas.select(".y.axis").call(this.meta.yAxis)
                };
                Chart.prototype.buildAxisLabel = function() {
                    var xLabel, yLabel;
                    var canvas = this.canvas;
                    xLabel = canvas.selectAll("text.x.axis-label").data(function(d) {
                        return [d.xLabel].filter(Boolean)
                    });
                    xLabel.enter().append("text").attr("class", "x axis-label").attr("text-anchor", "end");
                    xLabel.attr("x", width).attr("y", height - 6).text(function(d) {
                        return d
                    });
                    xLabel.exit().remove();
                    yLabel = canvas.selectAll("text.y.axis-label").data(function(d) {
                        return [d.yLabel].filter(Boolean)
                    });
                    yLabel.enter().append("text").attr("class", "y axis-label").attr("y", 6).attr("dy", ".75em").attr("text-anchor", "end").attr("transform", "rotate(-90)");
                    yLabel.text(function(d) {
                        return d
                    });
                    yLabel.exit().remove()
                };
                Chart.prototype.buildContent = function() {
                    var self = this;
                    var canvas = this.canvas;
                    canvas.attr("transform", "translate(" + margin.left + "," + margin.top + ")").call(zoomBehavior).each(function() {
                        var el = d3.select(this);
                        var listeners = ["mousedown", "mousewheel", "mouseover", "DOMMouseScroll", "dblclick", "wheel", "MozMousePixelScroll"];
                        listeners = listeners.map(function(l) {
                            return l + ".zoom"
                        });
                        if (!el._hasZoomListeners) {
                            listeners.forEach(function(l) {
                                el["_" + l] = el.on(l)
                            })
                        }

                        function setState(state) {
                            listeners.forEach(function(l) {
                                state ? el.on(l, el["_" + l]) : el.on(l, null)
                            })
                        }
                        setState(!options.disableZoom)
                    });
                    var content = this.content = canvas.selectAll(":scope > g.content").data(function(d) {
                        return [d]
                    });
                    content.enter().append("g").attr("clip-path", "url(#function-plot-clip-" + this.id + ")").attr("class", "content");
                    var yOrigin = content.selectAll(":scope > path.y.origin").data([
                        [
                            [0, yScale.domain()[0]],
                            [0, yScale.domain()[1]]
                        ]
                    ]);
                    yOrigin.enter().append("path").attr("class", "y origin").attr("stroke", "black").attr("opacity", .2);
                    yOrigin.attr("d", line);
                    var xOrigin = content.selectAll(":scope > path.x.origin").data([
                        [
                            [xScale.domain()[0], 0],
                            [xScale.domain()[1], 0]
                        ]
                    ]);
                    xOrigin.enter().append("path").attr("class", "x origin").attr("stroke", "black").attr("opacity", .2);
                    xOrigin.attr("d", line);
                    content.call(annotations({
                        owner: self
                    }));
                    var graphs = content.selectAll(":scope > g.graph").data(function(d) {
                        return d.data.map(datumDefaults)
                    });
                    graphs.enter().append("g").attr("class", "graph");
                    graphs.each(function(d, index) {
                        d.index = index;
                        d3.select(this).call(graphTypes[d.graphType](self));
                        d3.select(this).call(helpers(self))
                    })
                };
                Chart.prototype.buildZoomHelper = function() {
                    var self = this;
                    this.canvas.enter.append("rect").attr("class", "zoom-and-drag").style("fill", "none").style("pointer-events", "all");
                    this.canvas.select(".zoom-and-drag").attr("width", width).attr("height", height).on("mouseover", function() {
                        self.emit("all:mouseover")
                    }).on("mouseout", function() {
                        self.emit("all:mouseout")
                    }).on("mousemove", function() {
                        self.emit("all:mousemove")
                    })
                };
                Chart.prototype.setUpPlugins = function() {
                    var plugins = options.plugins || [];
                    var self = this;
                    plugins.forEach(function(plugin) {
                        plugin(self)
                    })
                };
                Chart.prototype.addLink = function() {
                    for (var i = 0; i < arguments.length; i += 1) {
                        this.linkedGraphs.push(arguments[i])
                    }
                };
                Chart.prototype.updateAxes = function() {
                    var instance = this;
                    var canvas = instance.canvas;
                    canvas.select(".x.axis").call(instance.meta.xAxis);
                    canvas.select(".y.axis").call(instance.meta.yAxis);
                    canvas.selectAll(".axis path, .axis line").attr("fill", "none").attr("stroke", "black").attr("shape-rendering", "crispedges").attr("opacity", .1)
                };
                Chart.prototype.syncOptions = function() {
                    this.options.xDomain = this.meta.xScale.domain();
                    this.options.yDomain = this.meta.yScale.domain()
                };
                Chart.prototype.programmaticZoom = function(xDomain, yDomain) {
                    var instance = this;
                    d3.transition().duration(750).tween("zoom", function() {
                        var ix = d3.interpolate(xScale.domain(), xDomain);
                        var iy = d3.interpolate(yScale.domain(), yDomain);
                        return function(t) {
                            zoomBehavior.x(xScale.domain(ix(t))).y(yScale.domain(iy(t)));
                            instance.draw()
                        }
                    }).each("end", function() {
                        instance.emit("programmatic-zoom")
                    })
                };
                Chart.prototype.getFontSize = function() {
                    return Math.max(Math.max(width, height) / 50, 8)
                };
                Chart.prototype.draw = function() {
                    var instance = this;
                    instance.emit("before:draw");
                    instance.syncOptions();
                    instance.updateAxes();
                    instance.buildContent();
                    instance.emit("after:draw")
                };
                Chart.prototype.setUpEventListeners = function() {
                    var instance = this;
                    var events = {
                        mousemove: function(x, y) {
                            instance.tip.move(x, y)
                        },
                        mouseover: function() {
                            instance.tip.show()
                        },
                        mouseout: function() {
                            instance.tip.hide()
                        },
                        "zoom:scaleUpdate": function(xOther, yOther) {
                            zoomBehavior.x(xScale.domain(xOther.domain())).y(yScale.domain(yOther.domain()))
                        },
                        "tip:update": function(x, y, index) {
                            var meta = instance.root.datum().data[index];
                            var title = meta.title || "";
                            var format = meta.renderer || function(x, y) {
                                    return x.toFixed(3) + ", " + y.toFixed(3)
                                };
                            var text = [];
                            title && text.push(title);
                            text.push(format(x, y));
                            instance.root.select(".top-right-legend").attr("fill", globals.COLORS[index]).text(text.join(" "))
                        }
                    };
                    var all = {
                        mousemove: function() {
                            var mouse = d3.mouse(instance.root.select("rect.zoom-and-drag").node());
                            var x = xScale.invert(mouse[0]);
                            var y = yScale.invert(mouse[1]);
                            instance.linkedGraphs.forEach(function(graph) {
                                graph.emit("mousemove", x, y)
                            })
                        },
                        zoom: function(xScale, yScale) {
                            instance.linkedGraphs.forEach(function(graph, i) {
                                if (i) {
                                    graph.emit("zoom:scaleUpdate", xScale, yScale)
                                }
                                graph.draw()
                            });
                            instance.emit("all:mousemove")
                        }
                    };
                    Object.keys(events).forEach(function(e) {
                        instance.on(e, events[e]);
                        !all[e] && instance.on("all:" + e, function() {
                            var args = Array.prototype.slice.call(arguments);
                            instance.linkedGraphs.forEach(function(graph) {
                                var localArgs = args.slice();
                                localArgs.unshift(e);
                                graph.emit.apply(graph, localArgs)
                            })
                        })
                    });
                    Object.keys(all).forEach(function(e) {
                        instance.on("all:" + e, all[e])
                    })
                };
                var instance = cache[options.id];
                if (!instance) {
                    instance = new Chart
                }
                return instance.build()
            };
            globals = module.exports.globals = require("./globals");
            graphTypes = module.exports.graphTypes = require("./graph-types/");
            module.exports.plugins = require("./plugins/");
            module.exports.eval = require("./helpers/eval")
        }, {
            "./datum-defaults": 4,
            "./globals": 6,
            "./graph-types/": 7,
            "./helpers/": 14,
            "./helpers/annotations": 11,
            "./helpers/eval": 13,
            "./plugins/": 18,
            "./polyfills": 20,
            "./tip": 23,
            events: 1,
            extend: 58
        }],
        17: [function(require, module, exports) {
            var d3 = window.d3;
            var extend = require("extend");
            var pressed = require("key-pressed");
            var keydown = require("keydown");
            var integrateSimpson = require("integrate-adaptive-simpson");
            module.exports = function(options) {
                options = extend({
                    key: "<shift>",
                    toggle: false
                }, options);
                var brush = d3.svg.brush();
                var kd = keydown(options.key);
                var visible = false;
                var cachedInstance;

                function wrapper(datum) {
                    return function(x) {
                        var functionPlot = window.functionPlot;
                        return functionPlot.eval.builtIn(datum, "fn", {
                            x: x
                        })
                    }
                }

                function setBrushState(visible) {
                    var brushEl = cachedInstance.canvas.selectAll(".definite-integral");
                    brushEl.style("display", visible ? null : "none")
                }

                function inner(instance) {
                    cachedInstance = instance;
                    var oldDisableZoom;
                    brush.x(instance.meta.xScale).on("brushstart", function() {
                        if (!d3.event.sourceEvent) return;
                        oldDisableZoom = !!instance.options.disableZoom;
                        instance.options.disableZoom = true;
                        instance.emit("draw")
                    }).on("brushend", function() {
                        if (!d3.event.sourceEvent) return;
                        instance.options.disableZoom = oldDisableZoom;
                        if (!brush.empty()) {
                            var a = brush.extent()[0];
                            var b = brush.extent()[1];
                            instance.options.data.forEach(function(datum, i) {
                                var value = integrateSimpson(wrapper(datum), a, b, options.tol, options.maxdepth);
                                instance.emit("definite-integral", datum, i, value, a, b)
                            })
                        }
                        instance.draw()
                    });
                    var brushEl = instance.canvas.append("g").attr("class", "brush definite-integral");
                    brushEl.call(brush).call(brush.event);
                    instance.canvas.selectAll(".brush .extent").attr("stroke", "#fff").attr("fill-opacity", .125).attr("shape-rendering", "crispEdges");
                    brushEl.selectAll("rect").attr("height", instance.meta.height);
                    instance.canvas.on("mousemove.definiteIntegral", function() {
                        if (!options.toggle) {
                            inner.visible(pressed(options.key))
                        }
                    });
                    kd.on("pressed", function() {
                        inner.visible(options.toggle ? !inner.visible() : true)
                    });
                    inner.visible(false)
                }
                inner.visible = function(_) {
                    if (!arguments.length) {
                        return visible
                    }
                    visible = _;
                    setBrushState(_);
                    return inner
                };
                return inner
            }
        }, {
            extend: 58,
            "integrate-adaptive-simpson": 59,
            "key-pressed": 107,
            keydown: 109
        }],
        18: [function(require, module, exports) {
            module.exports = {
                zoomBox: require("./zoom-box"),
                definiteIntegral: require("./definite-integral")
            }
        }, {
            "./definite-integral": 17,
            "./zoom-box": 19
        }],
        19: [function(require, module, exports) {
            var d3 = window.d3;
            var extend = require("extend");

            var pressed = require("key-pressed");
            var keydown = require("keydown");
            module.exports = function(options) {
                options = extend({
                    key: "<shift>",
                    toggle: false
                }, options);
                var brush = d3.svg.brush();
                var kd = keydown(options.key);
                var cachedInstance;
                var visible = false;

                function setBrushState(visible) {
                    var brushEl = cachedInstance.canvas.selectAll(".zoom-box");
                    brushEl.style("display", visible ? null : "none")
                }

                function inner(instance) {
                    cachedInstance = instance;
                    var oldDisableZoom;
                    brush.x(instance.meta.xScale).y(instance.meta.yScale).on("brushstart", function() {
                        if (!d3.event.sourceEvent) return;
                        oldDisableZoom = !!instance.options.disableZoom;
                        instance.options.disableZoom = true;
                        instance.draw()
                    }).on("brushend", function() {
                        if (!d3.event.sourceEvent) return;
                        instance.options.disableZoom = oldDisableZoom;
                        if (!brush.empty()) {
                            var lo = brush.extent()[0];
                            var hi = brush.extent()[1];
                            var x = [lo[0], hi[0]];
                            var y = [lo[1], hi[1]];
                            instance.programmaticZoom(x, y)
                        }
                        d3.select(this).transition().duration(1).call(brush.clear()).call(brush.event)
                    });
                    var brushEl = instance.canvas.append("g").attr("class", "brush zoom-box");
                    brushEl.call(brush).call(brush.event);
                    instance.canvas.selectAll(".brush .extent").attr("stroke", "#fff").attr("fill-opacity", .125).attr("shape-rendering", "crispEdges");
                    instance.canvas.on("mousemove.zoombox", function() {
                        if (!options.toggle) {
                            inner.visible(pressed(options.key))
                        }
                    });
                    kd.on("pressed", function() {
                        inner.visible(options.toggle ? !inner.visible() : true)
                    });
                    inner.visible(false)
                }
                inner.visible = function(_) {
                    if (!arguments.length) {
                        return visible
                    }
                    visible = _;
                    setBrushState(_);
                    return inner
                };
                return inner
            }
        }, {
            extend: 58,
            "key-pressed": 107,
            keydown: 109
        }],
        20: [function(require, module, exports) {
            (function(doc, proto) {
                try {
                    doc.querySelector(":scope body")
                } catch (err) {
                    ["querySelector", "querySelectorAll"].forEach(function(method) {
                        var native = proto[method];
                        proto[method] = function(selectors) {
                            if (/(^|,)\s*:scope/.test(selectors)) {
                                var id = this.id;
                                this.id = "ID_" + Date.now();
                                selectors = selectors.replace(/((^|,)\s*):scope/g, "$1#" + this.id);
                                var result = doc[method](selectors);
                                this.id = id;
                                return result
                            } else {
                                return native.call(this, selectors)
                            }
                        }
                    })
                }
            })(window.document, Element.prototype)
        }, {}],
        21: [function(require, module, exports) {
            "use strict";
            var utils = require("../utils");
            var clamp = require("clamp");
            var evaluate = require("../helpers/eval").builtIn;

            function checkAsymptote(d0, d1, meta, sign, level) {
                if (!level) {
                    return {
                        asymptote: true,
                        d0: d0,
                        d1: d1
                    }
                }
                var i;
                var n = 10;
                var x0 = d0[0];
                var x1 = d1[0];
                var samples = utils.linspace([x0, x1], n);
                var oldY, oldX;
                for (i = 0; i < n; i += 1) {
                    var x = samples[i];
                    var y = evaluate(meta, "fn", {
                        x: x
                    });
                    if (i) {
                        var deltaY = y - oldY;
                        var newSign = utils.sgn(deltaY);
                        if (newSign === sign) {
                            return checkAsymptote([oldX, oldY], [x, y], meta, sign, level - 1)
                        }
                    }
                    oldY = y;
                    oldX = x
                }
                return {
                    asymptote: false,
                    d0: d0,
                    d1: d1
                }
            }

            function split(chart, meta, data) {
                var i, oldSign;
                var deltaX;
                var st = [];
                var sets = [];
                var domain = chart.meta.yScale.domain();
                var zoomScale = chart.meta.zoomBehavior.scale();
                var yMin = domain[0];
                var yMax = domain[1];
                if (data[0]) {
                    st.push(data[0]);
                    deltaX = data[1][0] - data[0][0];
                    oldSign = utils.sgn(data[1][1] - data[0][1])
                }

                function updateY(d) {
                    d[1] = Math.min(d[1], yMax);
                    d[1] = Math.max(d[1], yMin);
                    return d
                }
                i = 1;
                while (i < data.length) {
                    var y0 = data[i - 1][1];
                    var y1 = data[i][1];
                    var deltaY = y1 - y0;
                    var newSign = utils.sgn(deltaY);
                    if (oldSign !== newSign && Math.abs(deltaY / deltaX) > 1 / zoomScale) {
                        var check = checkAsymptote(data[i - 1], data[i], meta, newSign, 3);
                        if (check.asymptote) {
                            st.push(updateY(check.d0));
                            sets.push(st);
                            st = [updateY(check.d1)]
                        }
                    }
                    oldSign = newSign;
                    st.push(data[i]);
                    ++i
                }
                if (st.length) {
                    sets.push(st)
                }
                return sets
            }

            function linear(chart, meta, range, n) {
                var allX = utils.linspace(range, n);
                var yDomain = chart.meta.yScale.domain();
                var yDomainMargin = yDomain[1] - yDomain[0];
                var yMin = yDomain[0] - yDomainMargin * 1e5;
                var yMax = yDomain[1] + yDomainMargin * 1e5;
                var data = [];
                var i;
                for (i = 0; i < allX.length; i += 1) {
                    var x = allX[i];
                    var y = evaluate(meta, "fn", {
                        x: x
                    });
                    if (utils.isValidNumber(x) && utils.isValidNumber(y)) {
                        data.push([x, clamp(y, yMin, yMax)])
                    }
                }
                data = split(chart, meta, data);
                return data
            }

            function parametric(chart, meta, range, nSamples) {
                var parametricRange = meta.range || [0, 2 * Math.PI];
                var tCoords = utils.linspace(parametricRange, nSamples);
                var samples = [];
                for (var i = 0; i < tCoords.length; i += 1) {
                    var t = tCoords[i];
                    var x = evaluate(meta, "x", {
                        t: t
                    });
                    var y = evaluate(meta, "y", {
                        t: t
                    });
                    samples.push([x, y])
                }
                return [samples]
            }

            function polar(chart, meta, range, nSamples) {
                var polarRange = meta.range || [-Math.PI, Math.PI];
                var thetaSamples = utils.linspace(polarRange, nSamples);
                var samples = [];
                for (var i = 0; i < thetaSamples.length; i += 1) {
                    var theta = thetaSamples[i];
                    var r = evaluate(meta, "r", {
                        theta: theta
                    });
                    var x = r * Math.cos(theta);
                    var y = r * Math.sin(theta);
                    samples.push([x, y])
                }
                return [samples]
            }

            function points(chart, meta, range, nSamples) {
                return [meta.points]
            }

            function vector(chart, meta, range, nSamples) {
                meta.offset = meta.offset || [0, 0];
                return [
                    [meta.offset, [meta.vector[0] + meta.offset[0], meta.vector[1] + meta.offset[1]]]
                ]
            }
            var sampler = function(chart, d, range, nSamples) {
                var fnTypes = {
                    parametric: parametric,
                    polar: polar,
                    points: points,
                    vector: vector,
                    linear: linear
                };
                if (!(d.fnType in fnTypes)) {
                    throw Error(d.fnType + " is not supported in the `builtIn` sampler")
                }
                return fnTypes[d.fnType].apply(null, arguments)
            };
            module.exports = sampler
        }, {
            "../helpers/eval": 13,
            "../utils": 24,
            clamp: 57
        }],
        22: [function(require, module, exports) {
            "use strict";
            var intervalArithmeticEval = require("interval-arithmetic-eval");
            var Interval = intervalArithmeticEval.Interval;
            var evaluate = require("../helpers/eval").interval;
            var utils = require("../utils");
            intervalArithmeticEval.policies.disableRounding();

            function interval1d(chart, meta, range, nSamples) {
                var xCoords = utils.linspace(range, nSamples);
                var xScale = chart.meta.xScale;
                var yScale = chart.meta.yScale;
                var yMin = yScale.domain()[0];
                var yMax = yScale.domain()[1];
                var samples = [];
                var i;
                for (i = 0; i < xCoords.length - 1; i += 1) {
                    var x = {
                        lo: xCoords[i],
                        hi: xCoords[i + 1]
                    };
                    var y = evaluate(meta, "fn", {
                        x: x
                    });
                    if (!Interval.empty(y) && !Interval.whole(y)) {
                        samples.push([x, y])
                    }
                    if (Interval.whole(y)) {
                        samples.push(null)
                    }
                }
                for (i = 1; i < samples.length - 1; i += 1) {
                    if (!samples[i]) {
                        var prev = samples[i - 1];
                        var next = samples[i + 1];
                        if (prev && next && !Interval.overlap(prev[1], next[1])) {
                            if (prev[1].lo > next[1].hi) {
                                prev[1].hi = Math.max(yMax, prev[1].hi);
                                next[1].lo = Math.min(yMin, next[1].lo)
                            }
                            if (prev[1].hi < next[1].lo) {
                                prev[1].lo = Math.min(yMin, prev[1].lo);
                                next[1].hi = Math.max(yMax, next[1].hi)
                            }
                        }
                    }
                }
                samples.scaledDx = xScale(xCoords[1]) - xScale(xCoords[0]);
                return [samples]
            }
            var rectEps;

            function smallRect(x, y) {
                return Interval.width(x) < rectEps
            }

            function quadTree(x, y, meta) {
                var sample = evaluate(meta, "fn", {
                    x: x,
                    y: y
                });
                var fulfills = Interval.zeroIn(sample);
                if (!fulfills) {
                    return this
                }
                if (smallRect(x, y)) {
                    this.push([x, y]);
                    return this
                }
                var midX = x.lo + (x.hi - x.lo) / 2;
                var midY = y.lo + (y.hi - y.lo) / 2;
                var east = {
                    lo: midX,
                    hi: x.hi
                };
                var west = {
                    lo: x.lo,
                    hi: midX
                };
                var north = {
                    lo: midY,
                    hi: y.hi
                };
                var south = {
                    lo: y.lo,
                    hi: midY
                };
                quadTree.call(this, east, north, meta);
                quadTree.call(this, east, south, meta);
                quadTree.call(this, west, north, meta);
                quadTree.call(this, west, south, meta)
            }

            function interval2d(chart, meta) {
                var xScale = chart.meta.xScale;
                var xDomain = chart.meta.xScale.domain();
                var yDomain = chart.meta.yScale.domain();
                var x = {
                    lo: xDomain[0],
                    hi: xDomain[1]
                };
                var y = {
                    lo: yDomain[0],
                    hi: yDomain[1]
                };
                var samples = [];
                rectEps = xScale.invert(1) - xScale.invert(0);
                quadTree.call(samples, x, y, meta);
                samples.scaledDx = 1;
                return [samples]
            }
            var sampler = function(chart, d, range, nSamples) {
                var fnTypes = {
                    implicit: interval2d,
                    linear: interval1d
                };
                if (!fnTypes.hasOwnProperty(d.fnType)) {
                    throw Error(d.fnType + " is not supported in the `interval` sampler")
                }
                return fnTypes[d.fnType].apply(null, arguments)
            };
            module.exports = sampler
        }, {
            "../helpers/eval": 13,
            "../utils": 24,
            "interval-arithmetic-eval": 60
        }],
        23: [function(require, module, exports) {
            "use strict";
            var d3 = window.d3;
            var extend = require("extend");
            var utils = require("./utils");
            var clamp = require("clamp");
            var globals = require("./globals");
            var builtInEvaluator = require("./helpers/eval").builtIn;
            module.exports = function(config) {
                config = extend({
                    xLine: false,
                    yLine: false,
                    renderer: function(x, y) {
                        return "(" + x.toFixed(3) + ", " + y.toFixed(3) + ")"
                    },
                    owner: null
                }, config);
                var MARGIN = 20;
                var line = d3.svg.line().x(function(d) {
                    return d[0]
                }).y(function(d) {
                    return d[1]
                });

                function lineGenerator(el, data) {
                    return el.append("path").datum(data).attr("stroke", "grey").attr("stroke-dasharray", "5,5").attr("opacity", .5).attr("d", line)
                }

                function tip(selection) {
                    var innerSelection = selection.selectAll("g.tip").data(function(d) {
                        return [d]
                    });
                    innerSelection.enter().append("g").attr("class", "tip").attr("clip-path", "url(#function-plot-clip-" + config.owner.id + ")");
                    tip.el = innerSelection.selectAll("g.inner-tip").data(function(d) {
                        return [d]
                    });
                    tip.el.enter().append("g").attr("class", "inner-tip").style("display", "none").each(function() {
                        var el = d3.select(this);
                        lineGenerator(el, [
                            [0, -config.owner.meta.height - MARGIN],
                            [0, config.owner.meta.height + MARGIN]
                        ]).attr("class", "tip-x-line").style("display", "none");
                        lineGenerator(el, [
                            [-config.owner.meta.width - MARGIN, 0],
                            [config.owner.meta.width + MARGIN, 0]
                        ]).attr("class", "tip-y-line").style("display", "none");
                        el.append("circle").attr("r", 3);
                        el.append("text").attr("transform", "translate(5,-5)")
                    });
                    selection.selectAll(".tip-x-line").style("display", config.xLine ? null : "none");
                    selection.selectAll(".tip-y-line").style("display", config.yLine ? null : "none")
                }
                tip.move = function(x0, y0) {
                    var i;
                    var minDist = Infinity;
                    var closestIndex = -1;
                    var x, y;
                    var el = tip.el;
                    var inf = 1e8;
                    var meta = config.owner.meta;
                    var data = el.data()[0].data;
                    var xScale = meta.xScale;
                    var yScale = meta.yScale;
                    var width = meta.width;
                    var height = meta.height;
                    for (i = 0; i < data.length; i += 1) {
                        if (data[i].skipTip || data[i].fnType !== "linear") {
                            continue
                        }
                        var range = data[i].range || [-inf, inf];
                        if (x0 > range[0] - globals.TIP_X_EPS && x0 < range[1] + globals.TIP_X_EPS) {
                            var candidateY = builtInEvaluator(data[i], "fn", {
                                x: x0
                            });
                            if (utils.isValidNumber(candidateY)) {
                                var tDist = Math.abs(candidateY - y0);
                                if (tDist < minDist) {
                                    minDist = tDist;
                                    closestIndex = i
                                }
                            }
                        }
                    }
                    if (closestIndex !== -1) {
                        x = x0;
                        if (data[closestIndex].range) {
                            x = Math.max(x, data[closestIndex].range[0]);
                            x = Math.min(x, data[closestIndex].range[1])
                        }
                        y = builtInEvaluator(data[closestIndex], "fn", {
                            x: x
                        });
                        tip.show();
                        config.owner.emit("tip:update", x, y, closestIndex);
                        var clampX = clamp(x, xScale.invert(-MARGIN), xScale.invert(width + MARGIN));
                        var clampY = clamp(y, yScale.invert(height + MARGIN), yScale.invert(-MARGIN));
                        var color = utils.color(data[closestIndex], closestIndex);
                        el.attr("transform", "translate(" + xScale(clampX) + "," + yScale(clampY) + ")");
                        el.select("circle").attr("fill", color);
                        el.select("text").attr("fill", color).text(config.renderer(x, y))
                    } else {
                        tip.hide()
                    }
                };
                tip.show = function() {
                    this.el.style("display", null)
                };
                tip.hide = function() {
                    this.el.style("display", "none")
                };
                Object.keys(config).forEach(function(option) {
                    utils.getterSetter.call(tip, config, option)
                });
                return tip
            }
        }, {
            "./globals": 6,
            "./helpers/eval": 13,
            "./utils": 24,
            clamp: 57,
            extend: 58
        }],
        24: [function(require, module, exports) {
            "use strict";
            var globals = require("./globals");
            module.exports = {
                isValidNumber: function(v) {
                    return typeof v === "number" && !isNaN(v)
                },
                linspace: function(range, n) {
                    var samples = [];
                    var delta = (range[1] - range[0]) / (n - 1);
                    for (var i = 0; i < n; i += 1) {
                        samples.push(range[0] + i * delta)
                    }
                    return samples
                },
                getterSetter: function(config, option) {
                    var me = this;
                    this[option] = function(value) {
                        if (!arguments.length) {
                            return config[option]
                        }
                        config[option] = value;
                        return me
                    }
                },
                sgn: function(v) {
                    if (v < 0) {
                        return -1
                    }
                    if (v > 0) {
                        return 1
                    }
                    return 0
                },
                color: function(data, index) {
                    return data.color || globals.COLORS[index]
                }
            }
        }, {
            "./globals": 6
        }],
        25: [function(require, module, exports) {
            "use strict";
            module.exports = require("./lib/eval")
        }, {
            "./lib/eval": 27
        }],
        26: [function(require, module, exports) {
            "use strict";
            module.exports = function() {
                var math = Object.create(Math);
                math.factory = function(a) {
                    if (typeof a !== "number") {
                        throw new TypeError("built-in math factory only accepts numbers")
                    }
                    return Number(a)
                };
                math.add = function(a, b) {
                    return a + b
                };
                math.sub = function(a, b) {
                    return a - b
                };
                math.mul = function(a, b) {
                    return a * b
                };
                math.div = function(a, b) {
                    return a / b
                };
                math.mod = function(a, b) {
                    return a % b
                };
                math.factorial = function(a) {
                    var res = 1;
                    for (var i = 2; i <= a; i += 1) {
                        res *= i
                    }
                    return res
                };
                math.logicalOR = function(a, b) {
                    return a || b
                };
                math.logicalXOR = function(a, b) {
                    return a != b
                };
                math.logicalAND = function(a, b) {
                    return a && b
                };
                math.bitwiseOR = function(a, b) {
                    return a | b
                };
                math.bitwiseXOR = function(a, b) {
                    return a ^ b
                };
                math.bitwiseAND = function(a, b) {
                    return a & b
                };
                math.lessThan = function(a, b) {
                    return a < b
                };
                math.lessEqualThan = function(a, b) {
                    return a <= b
                };
                math.greaterThan = function(a, b) {
                    return a > b
                };
                math.greaterEqualThan = function(a, b) {
                    return a >= b
                };
                math.equal = function(a, b) {
                    return a == b
                };
                math.strictlyEqual = function(a, b) {
                    return a === b
                };
                math.notEqual = function(a, b) {
                    return a != b
                };
                math.strictlyNotEqual = function(a, b) {
                    return a !== b
                };
                math.shiftRight = function(a, b) {
                    return a >> b
                };
                math.shiftLeft = function(a, b) {
                    return a << b
                };
                math.unsignedRightShift = function(a, b) {
                    return a >>> b
                };
                math.negative = function(a) {
                    return -a
                };
                math.positive = function(a) {
                    return a
                };
                return math
            }
        }, {}],
        27: [function(require, module, exports) {
            "use strict";
            var CodeGenerator = require("math-codegen");
            var math = require("./adapter")();

            function processScope(scope) {
                Object.keys(scope).forEach(function(k) {
                    var value = scope[k];
                    scope[k] = math.factory(value)
                })
            }
            module.exports = function(expression) {
                return (new CodeGenerator).setDefs({
                    $$processScope: processScope
                }).parse(expression).compile(math)
            };
            module.exports.math = math
        }, {
            "./adapter": 26,
            "math-codegen": 28
        }],
        28: [function(require, module, exports) {
            "use strict";
            module.exports = require("./lib/CodeGenerator")
        }, {
            "./lib/CodeGenerator": 29
        }],
        29: [function(require, module, exports) {
            "use strict";
            var Parser = require("mr-parser").Parser;
            var Interpreter = require("./Interpreter");
            var extend = require("extend");

            function CodeGenerator(options, defs) {
                this.statements = [];
                this.defs = defs || {};
                this.interpreter = new Interpreter(this, options)
            }
            CodeGenerator.prototype.setDefs = function(defs) {
                this.defs = extend(this.defs, defs);
                return this
            };
            CodeGenerator.prototype.compile = function(namespace) {
                if (!namespace || !(typeof namespace === "object" || typeof namespace === "function")) {
                    throw TypeError("namespace must be an object")
                }
                if (typeof namespace.factory !== "function") {
                    throw TypeError("namespace.factory must be a function")
                }
                this.defs.ns = namespace;
                this.defs.$$mathCodegen = {
                    getProperty: function(symbol, scope, ns) {
                        if (symbol in scope) {
                            return scope[symbol]
                        }
                        if (symbol in ns) {
                            return ns[symbol]
                        }
                        throw SyntaxError('symbol "' + symbol + '" is undefined')
                    },
                    functionProxy: function(fn, name) {
                        if (typeof fn !== "function") {
                            throw SyntaxError('symbol "' + name + '" must be a function')
                        }
                        return fn
                    }
                };
                this.defs.$$processScope = this.defs.$$processScope || function() {};
                var defsCode = Object.keys(this.defs).map(function(name) {
                    return "var " + name + ' = defs["' + name + '"]'
                });
                if (!this.statements.length) {
                    throw Error("there are no statements saved in this generator, make sure you parse an expression before compiling it")
                }
                this.statements[this.statements.length - 1] = "return " + this.statements[this.statements.length - 1];
                var code = this.statements.join(";");
                var factoryCode = defsCode.join("\n") + "\n" + ["return {", "  eval: function (scope) {", "    scope = scope || {}", "    $$processScope(scope)", "    " + code, "  },", "  code: '" + code + "'", "}"].join("\n");
                var factory = new Function("defs", factoryCode);
                return factory(this.defs)
            };
            CodeGenerator.prototype.parse = function(code) {
                var self = this;
                var program = (new Parser).parse(code);
                this.statements = program.blocks.map(function(statement) {
                    return self.interpreter.next(statement)
                });
                return this
            };
            module.exports = CodeGenerator
        }, {
            "./Interpreter": 30,
            extend: 41,
            "mr-parser": 42
        }],
        30: [function(require, module, exports) {
            "use strict";
            var extend = require("extend");
            var types = {
                ArrayNode: require("./node/ArrayNode"),
                AssignmentNode: require("./node/AssignmentNode"),
                ConditionalNode: require("./node/ConditionalNode"),
                ConstantNode: require("./node/ConstantNode"),
                FunctionNode: require("./node/FunctionNode"),
                OperatorNode: require("./node/OperatorNode"),
                SymbolNode: require("./node/SymbolNode"),
                UnaryNode: require("./node/UnaryNode")
            };
            var Interpreter = function(owner, options) {
                this.owner = owner;
                this.options = extend({
                    factory: "ns.factory",
                    raw: false,
                    rawArrayExpressionElements: true,
                    rawCallExpressionElements: false
                }, options)
            };
            extend(Interpreter.prototype, types);
            Interpreter.prototype.next = function(node) {
                if (!(node.type in this)) {
                    throw new TypeError("the node type " + node.type + " is not implemented")
                }
                return this[node.type](node)
            };
            Interpreter.prototype.rawify = function(test, fn) {
                var oldRaw = this.options.raw;
                if (test) {
                    this.options.raw = true
                }
                fn();
                if (test) {
                    this.options.raw = oldRaw
                }
            };
            module.exports = Interpreter
        }, {
            "./node/ArrayNode": 33,
            "./node/AssignmentNode": 34,
            "./node/ConditionalNode": 35,
            "./node/ConstantNode": 36,
            "./node/FunctionNode": 37,
            "./node/OperatorNode": 38,
            "./node/SymbolNode": 39,
            "./node/UnaryNode": 40,
            extend: 41
        }],
        31: [function(require, module, exports) {
            "use strict";
            module.exports = {
                "+": "add",
                "-": "sub",
                "*": "mul",
                "/": "div",
                "^": "pow",
                "%": "mod",
                "!": "factorial",
                "|": "bitwiseOR",
                "^|": "bitwiseXOR",
                "&": "bitwiseAND",
                "||": "logicalOR",
                xor: "logicalXOR",
                "&&": "logicalAND",
                "<": "lessThan",
                ">": "greaterThan",
                "<=": "lessEqualThan",
                ">=": "greaterEqualThan",
                "===": "strictlyEqual",
                "==": "equal",
                "!==": "strictlyNotEqual",
                "!=": "notEqual",
                ">>": "shiftRight",
                "<<": "shiftLeft",
                ">>>": "unsignedRightShift"
            }
        }, {}],
        32: [function(require, module, exports) {
            "use strict";
            module.exports = {
                "+": "positive",
                "-": "negative",
                "~": "oneComplement"
            }
        }, {}],
        33: [function(require, module, exports) {
            "use strict";
            module.exports = function(node) {
                var self = this;
                var arr = [];
                this.rawify(this.options.rawArrayExpressionElements, function() {
                    arr = node.nodes.map(function(el) {
                        return self.next(el)
                    })
                });
                var arrString = "[" + arr.join(",") + "]";
                if (this.options.raw) {
                    return arrString
                }
                return this.options.factory + "(" + arrString + ")"
            }
        }, {}],
        34: [function(require, module, exports) {
            "use strict";
            module.exports = function(node) {
                return 'scope["' + node.name + '"] = ' + this.next(node.expr)
            }
        }, {}],
        35: [function(require, module, exports) {
            "use strict";
            module.exports = function(node) {
                var condition = "!!(" + this.next(node.condition) + ")";
                var trueExpr = this.next(node.trueExpr);
                var falseExpr = this.next(node.falseExpr);
                return "(" + condition + " ? (" + trueExpr + ") : (" + falseExpr + ") )"
            }
        }, {}],
        36: [function(require, module, exports) {
            "use strict";
            module.exports = function(node) {
                if (this.options.raw) {
                    return node.value
                }
                return this.options.factory + "(" + node.value + ")"
            }
        }, {}],
        37: [function(require, module, exports) {
            "use strict";
            var SymbolNode = require("mr-parser").nodeTypes.SymbolNode;
            var functionProxy = function(node) {
                return "$$mathCodegen.functionProxy(" + this.next(new SymbolNode(node.name)) + ', "' + node.name + '")'
            };
            module.exports = function(node) {
                var self = this;
                var method = functionProxy.call(this, node);
                var args = [];
                this.rawify(this.options.rawCallExpressionElements, function() {
                    args = node.args.map(function(arg) {
                        return self.next(arg)
                    })
                });
                return method + "(" + args.join(", ") + ")"
            };
            module.exports.functionProxy = functionProxy
        }, {
            "mr-parser": 42
        }],
        38: [function(require, module, exports) {
            "use strict";
            var Operators = require("../misc/Operators");
            module.exports = function(node) {
                if (this.options.raw) {
                    return ["(" + this.next(node.args[0]), node.op, this.next(node.args[1]) + ")"].join(" ")
                }
                var namedOperator = Operators[node.op];
                if (!namedOperator) {
                    throw TypeError("unidentified operator")
                }
                return this.FunctionNode({
                    name: namedOperator,
                    args: node.args
                })
            }
        }, {
            "../misc/Operators": 31
        }],
        39: [function(require, module, exports) {
            "use strict";
            module.exports = function(node) {
                var id = node.name;
                return '$$mathCodegen.getProperty("' + id + '", scope, ns)'
            }
        }, {}],
        40: [function(require, module, exports) {
            "use strict";
            var UnaryOperators = require("../misc/UnaryOperators");
            module.exports = function(node) {
                if (this.options.raw) {
                    return node.op + this.next(node.argument)
                }
                if (!(node.op in UnaryOperators)) {
                    throw new SyntaxError(node.op + " not implemented")
                }
                var namedOperator = UnaryOperators[node.op];
                return this.FunctionNode({
                    name: namedOperator,
                    args: [node.argument]
                })
            }
        }, {
            "../misc/UnaryOperators": 32
        }],
        41: [function(require, module, exports) {
            "use strict";
            var hasOwn = Object.prototype.hasOwnProperty;
            var toStr = Object.prototype.toString;
            var isArray = function isArray(arr) {
                if (typeof Array.isArray === "function") {
                    return Array.isArray(arr)
                }
                return toStr.call(arr) === "[object Array]"
            };
            var isPlainObject = function isPlainObject(obj) {
                if (!obj || toStr.call(obj) !== "[object Object]") {
                    return false
                }
                var hasOwnConstructor = hasOwn.call(obj, "constructor");
                var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, "isPrototypeOf");
                if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
                    return false
                }
                var key;
                for (key in obj) {}
                return typeof key === "undefined" || hasOwn.call(obj, key)
            };
            module.exports = function extend() {
                var options, name, src, copy, copyIsArray, clone, target = arguments[0],
                    i = 1,
                    length = arguments.length,
                    deep = false;
                if (typeof target === "boolean") {
                    deep = target;
                    target = arguments[1] || {};
                    i = 2
                } else if (typeof target !== "object" && typeof target !== "function" || target == null) {
                    target = {}
                }
                for (; i < length; ++i) {
                    options = arguments[i];
                    if (options != null) {
                        for (name in options) {
                            src = target[name];
                            copy = options[name];
                            if (target !== copy) {
                                if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                                    if (copyIsArray) {
                                        copyIsArray = false;
                                        clone = src && isArray(src) ? src : []
                                    } else {
                                        clone = src && isPlainObject(src) ? src : {}
                                    }
                                    target[name] = extend(deep, clone, copy)
                                } else if (typeof copy !== "undefined") {
                                    target[name] = copy
                                }
                            }
                        }
                    }
                }
                return target
            }
        }, {}],
        42: [function(require, module, exports) {
            "use strict";
            module.exports.Lexer = require("./lib/Lexer");
            module.exports.Parser = require("./lib/Parser");
            module.exports.nodeTypes = require("./lib/node/")
        }, {
            "./lib/Lexer": 43,
            "./lib/Parser": 44,
            "./lib/node/": 55
        }],
        43: [function(require, module, exports) {
            var tokenType = require("./token-type");
            var ESCAPES = {
                n: "\n",
                f: "\f",
                r: "\r",
                t: "	",
                v: "",
                "'": "'",
                '"': '"'
            };
            var DELIMITERS = {
                ",": true,
                "(": true,
                ")": true,
                "[": true,
                "]": true,
                ";": true,
                "~": true,
                "!": true,
                "+": true,
                "-": true,
                "*": true,
                "/": true,
                "%": true,
                "^": true,
                "**": true,
                "|": true,
                "&": true,
                "^|": true,
                "=": true,
                ":": true,
                "?": true,
                "||": true,
                "&&": true,
                xor: true,
                "==": true,
                "!=": true,
                "===": true,
                "!==": true,
                "<": true,
                ">": true,
                ">=": true,
                "<=": true,
                ">>>": true,
                "<<": true,
                ">>": true
            };

            function isDigit(c) {
                return c >= "0" && c <= "9"
            }

            function isIdentifier(c) {
                return c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c === "$" || c === "_"
            }

            function isWhitespace(c) {
                return c === " " || c === "\r" || c === "	" || c === "\n" || c === "" || c === " "
            }

            function isDelimiter(str) {
                return DELIMITERS[str]
            }

            function isQuote(c) {
                return c === "'" || c === '"'
            }

            function Lexer() {}
            Lexer.prototype.throwError = function(message, index) {
                index = typeof index === "undefined" ? this.index : index;
                var error = new Error(message + " at index " + index);
                error.index = index;
                error.description = message;
                throw error
            };
            Lexer.prototype.lex = function(text) {
                this.text = text;
                this.index = 0;
                this.tokens = [];
                while (this.index < this.text.length) {
                    while (isWhitespace(this.peek())) {
                        this.consume()
                    }
                    var c = this.peek();
                    var c2 = c + this.peek(1);
                    var c3 = c2 + this.peek(2);
                    if (isDelimiter(c3)) {
                        this.tokens.push({
                            type: tokenType.DELIMITER,
                            value: c3
                        });
                        this.consume();
                        this.consume();
                        this.consume()
                    } else if (isDelimiter(c2)) {
                        this.tokens.push({
                            type: tokenType.DELIMITER,
                            value: c2
                        });
                        this.consume();
                        this.consume()
                    } else if (isDelimiter(c)) {
                        this.tokens.push({
                            type: tokenType.DELIMITER,
                            value: c
                        });
                        this.consume()
                    } else if (isDigit(c) || c === "." && isDigit(this.peek(1))) {
                        this.tokens.push({
                            type: tokenType.NUMBER,
                            value: this.readNumber()
                        })
                    } else if (isQuote(c)) {
                        this.tokens.push({
                            type: tokenType.STRING,
                            value: this.readString()
                        })
                    } else if (isIdentifier(c)) {
                        this.tokens.push({
                            type: tokenType.SYMBOL,
                            value: this.readIdentifier()
                        })
                    } else {
                        this.throwError("unexpected character " + c)
                    }
                }
                this.tokens.push({
                    type: tokenType.EOF
                });
                return this.tokens
            };
            Lexer.prototype.peek = function(nth) {
                nth = nth || 0;
                if (this.index + nth >= this.text.length) {
                    return
                }
                return this.text.charAt(this.index + nth)
            };
            Lexer.prototype.consume = function() {
                var current = this.peek();
                this.index += 1;
                return current
            };
            Lexer.prototype.readNumber = function() {
                var number = "";
                if (this.peek() === ".") {
                    number += this.consume();
                    if (!isDigit(this.peek())) {
                        this.throwError("number expected")
                    }
                } else {
                    while (isDigit(this.peek())) {
                        number += this.consume()
                    }
                    if (this.peek() === ".") {
                        number += this.consume()
                    }
                }
                while (isDigit(this.peek())) {
                    number += this.consume()
                }
                if (this.peek() === "e" || this.peek() === "E") {
                    number += this.consume();
                    if (!(isDigit(this.peek()) || this.peek() === "+" || this.peek() === "-")) {
                        this.throwError()
                    }
                    if (this.peek() === "+" || this.peek() === "-") {
                        number += this.consume()
                    }
                    if (!isDigit(this.peek())) {
                        this.throwError("number expected")
                    }
                    while (isDigit(this.peek())) {
                        number += this.consume()
                    }
                }
                return number
            };
            Lexer.prototype.readIdentifier = function() {
                var text = "";
                while (isIdentifier(this.peek()) || isDigit(this.peek())) {
                    text += this.consume()
                }
                return text
            };
            Lexer.prototype.readString = function() {
                var quote = this.consume();
                var string = "";
                var escape;
                while (true) {
                    var c = this.consume();
                    if (!c) {
                        this.throwError("string is not closed")
                    }
                    if (escape) {
                        if (c === "u") {
                            var hex = this.text.substring(this.index + 1, this.index + 5);
                            if (!hex.match(/[\da-f]{4}/i)) {
                                this.throwError("invalid unicode escape")
                            }
                            this.index += 4;
                            string += String.fromCharCode(parseInt(hex, 16))
                        } else {
                            var replacement = ESCAPES[c];
                            if (replacement) {
                                string += replacement
                            } else {
                                string += c
                            }
                        }
                        escape = false
                    } else if (c === quote) {
                        break
                    } else if (c === "\\") {
                        escape = true
                    } else {
                        string += c
                    }
                }
                return string
            };
            module.exports = Lexer
        }, {
            "./token-type": 56
        }],
        44: [function(require, module, exports) {
            var tokenType = require("./token-type");
            var Lexer = require("./Lexer");
            var ConstantNode = require("./node/ConstantNode");
            var OperatorNode = require("./node/OperatorNode");
            var UnaryNode = require("./node/UnaryNode");
            var SymbolNode = require("./node/SymbolNode");
            var FunctionNode = require("./node/FunctionNode");
            var ArrayNode = require("./node/ArrayNode");
            var ConditionalNode = require("./node/ConditionalNode");
            var AssignmentNode = require("./node/AssignmentNode");
            var BlockNode = require("./node/BlockNode");

            function Parser() {
                this.lexer = new Lexer;
                this.tokens = null
            }
            Parser.prototype.current = function() {
                return this.tokens[0]
            };
            Parser.prototype.next = function() {
                return this.tokens[1]
            };
            Parser.prototype.peek = function() {
                if (this.tokens.length) {
                    var first = this.tokens[0];
                    for (var i = 0; i < arguments.length; i += 1) {
                        if (first.value === arguments[i]) {
                            return true
                        }
                    }
                }
            };
            Parser.prototype.consume = function(e) {
                return this.tokens.shift()
            };
            Parser.prototype.expect = function(e) {
                if (!this.peek(e)) {
                    throw Error("expected " + e)
                }
                return this.consume()
            };
            Parser.prototype.isEOF = function() {
                return this.current().type === tokenType.EOF
            };
            Parser.prototype.parse = function(text) {
                this.tokens = this.lexer.lex(text);
                return this.program()
            };
            Parser.prototype.program = function() {
                var blocks = [];
                while (!this.isEOF()) {
                    blocks.push(this.assignment());
                    if (this.peek(";")) {
                        this.consume()
                    }
                }
                this.end();
                return new BlockNode(blocks)
            };
            Parser.prototype.assignment = function() {
                var left = this.ternary();
                if (left instanceof SymbolNode && this.peek("=")) {
                    this.consume();
                    return new AssignmentNode(left.name, this.assignment())
                }
                return left
            };
            Parser.prototype.ternary = function() {
                var predicate = this.logicalOR();
                if (this.peek("?")) {
                    this.consume();
                    var truthy = this.ternary();
                    this.expect(":");
                    var falsy = this.ternary();
                    return new ConditionalNode(predicate, truthy, falsy)
                }
                return predicate
            };
            Parser.prototype.logicalOR = function() {
                var left = this.logicalXOR();
                if (this.peek("||")) {
                    var op = this.consume();
                    var right = this.logicalOR();
                    return new OperatorNode(op.value, [left, right])
                }
                return left
            };
            Parser.prototype.logicalXOR = function() {
                var left = this.logicalAND();
                if (this.current().value === "xor") {
                    var op = this.consume();
                    var right = this.logicalXOR();
                    return new OperatorNode(op.value, [left, right])
                }
                return left
            };
            Parser.prototype.logicalAND = function() {
                var left = this.bitwiseOR();
                if (this.peek("&&")) {
                    var op = this.consume();
                    var right = this.logicalAND();
                    return new OperatorNode(op.value, [left, right])
                }
                return left
            };
            Parser.prototype.bitwiseOR = function() {
                var left = this.bitwiseXOR();
                if (this.peek("|")) {
                    var op = this.consume();
                    var right = this.bitwiseOR();
                    return new OperatorNode(op.value, [left, right])
                }
                return left
            };
            Parser.prototype.bitwiseXOR = function() {
                var left = this.bitwiseAND();
                if (this.peek("^|")) {
                    var op = this.consume();
                    var right = this.bitwiseXOR();
                    return new OperatorNode(op.value, [left, right])
                }
                return left
            };
            Parser.prototype.bitwiseAND = function() {
                var left = this.relational();
                if (this.peek("&")) {
                    var op = this.consume();
                    var right = this.bitwiseAND();
                    return new OperatorNode(op.value, [left, right])
                }
                return left
            };
            Parser.prototype.relational = function() {
                var left = this.shift();
                if (this.peek("==", "===", "!=", "!==", ">=", "<=", ">", "<")) {
                    var op = this.consume();
                    var right = this.shift();
                    return new OperatorNode(op.value, [left, right])
                }
                return left
            };
            Parser.prototype.shift = function() {
                var left = this.additive();
                if (this.peek(">>", "<<", ">>>")) {
                    var op = this.consume();
                    var right = this.shift();
                    return new OperatorNode(op.value, [left, right])
                }
                return left
            };
            Parser.prototype.additive = function() {
                var left = this.multiplicative();
                while (this.peek("+", "-")) {
                    var op = this.consume();
                    left = new OperatorNode(op.value, [left, this.multiplicative()])
                }
                return left
            };
            Parser.prototype.multiplicative = function() {
                var op, right;
                var left = this.unary();
                while (this.peek("*", "/", "%")) {
                    op = this.consume();
                    left = new OperatorNode(op.value, [left, this.unary()])
                }
                if (this.current().type === tokenType.SYMBOL || this.peek("(") || !(left.type instanceof ConstantNode) && this.current().type === tokenType.NUMBER) {
                    right = this.multiplicative();
                    return new OperatorNode("*", [left, right])
                }
                return left
            };
            Parser.prototype.unary = function() {
                if (this.peek("-", "+", "~")) {
                    var op = this.consume();
                    var right = this.unary();
                    return new UnaryNode(op.value, right)
                }
                return this.pow()
            };
            Parser.prototype.pow = function() {
                var left = this.factorial();
                if (this.peek("^", "**")) {
                    var op = this.consume();
                    var right = this.unary();
                    return new OperatorNode(op.value, [left, right])
                }
                return left
            };
            Parser.prototype.factorial = function() {
                var left = this.symbol();
                if (this.peek("!")) {
                    var op = this.consume();
                    return new OperatorNode(op.value, [left])
                }
                return left
            };
            Parser.prototype.symbol = function() {
                var current = this.current();
                if (current.type === tokenType.SYMBOL) {
                    var symbol = this.consume();
                    var node = this.functionCall(symbol);
                    return node
                }
                return this.string()
            };
            Parser.prototype.functionCall = function(symbolToken) {
                var name = symbolToken.value;
                if (this.peek("(")) {
                    this.consume();
                    var params = [];
                    while (!this.peek(")") && !this.isEOF()) {
                        params.push(this.assignment());
                        if (this.peek(",")) {
                            this.consume()
                        }
                    }
                    this.expect(")");
                    return new FunctionNode(name, params)
                }
                return new SymbolNode(name)
            };
            Parser.prototype.string = function() {
                if (this.current().type === tokenType.STRING) {
                    return new ConstantNode(this.consume().value, "string")
                }
                return this.array()
            };
            Parser.prototype.array = function() {
                if (this.peek("[")) {
                    this.consume();
                    var params = [];
                    while (!this.peek("]") && !this.isEOF()) {
                        params.push(this.assignment());
                        if (this.peek(",")) {
                            this.consume()
                        }
                    }
                    this.expect("]");
                    return new ArrayNode(params)
                }
                return this.number()
            };
            Parser.prototype.number = function() {
                var token = this.current();
                if (token.type === tokenType.NUMBER) {
                    return new ConstantNode(this.consume().value, "number")
                }
                return this.parentheses()
            };
            Parser.prototype.parentheses = function() {
                var token = this.current();
                if (token.value === "(") {
                    this.consume();
                    var left = this.assignment();
                    this.expect(")");
                    return left
                }
                return this.end()
            };
            Parser.prototype.end = function() {
                var token = this.current();
                if (token.type !== tokenType.EOF) {
                    throw Error("unexpected end of expression")
                }
            };
            module.exports = Parser
        }, {
            "./Lexer": 43,
            "./node/ArrayNode": 45,
            "./node/AssignmentNode": 46,
            "./node/BlockNode": 47,
            "./node/ConditionalNode": 48,
            "./node/ConstantNode": 49,
            "./node/FunctionNode": 50,
            "./node/OperatorNode": 52,
            "./node/SymbolNode": 53,
            "./node/UnaryNode": 54,
            "./token-type": 56
        }],
        45: [function(require, module, exports) {
            var Node = require("./Node");

            function ArrayNode(nodes) {
                this.nodes = nodes
            }
            ArrayNode.prototype = Object.create(Node.prototype);
            ArrayNode.prototype.type = "ArrayNode";
            module.exports = ArrayNode
        }, {
            "./Node": 51
        }],
        46: [function(require, module, exports) {
            var Node = require("./Node");

            function AssignmentNode(name, expr) {
                this.name = name;
                this.expr = expr
            }
            AssignmentNode.prototype = Object.create(Node.prototype);
            AssignmentNode.prototype.type = "AssignmentNode";
            module.exports = AssignmentNode
        }, {
            "./Node": 51
        }],
        47: [function(require, module, exports) {
            var Node = require("./Node");

            function BlockNode(blocks) {
                this.blocks = blocks
            }
            BlockNode.prototype = Object.create(Node.prototype);
            BlockNode.prototype.type = "BlockNode";
            module.exports = BlockNode
        }, {
            "./Node": 51
        }],
        48: [function(require, module, exports) {
            var Node = require("./Node");

            function ConditionalNode(predicate, truthy, falsy) {
                this.condition = predicate;
                this.trueExpr = truthy;
                this.falseExpr = falsy
            }
            ConditionalNode.prototype = Object.create(Node.prototype);
            ConditionalNode.prototype.type = "ConditionalNode";
            module.exports = ConditionalNode
        }, {
            "./Node": 51
        }],
        49: [function(require, module, exports) {
            var Node = require("./Node");
            var SUPPORTED_TYPES = {
                number: true,
                string: true,
                "boolean": true,
                undefined: true,
                "null": true
            };

            function ConstantNode(value, type) {
                if (!SUPPORTED_TYPES[type]) {
                    throw Error("unsupported type '" + type + "'")
                }
                this.value = value;
                this.valueType = type
            }
            ConstantNode.prototype = Object.create(Node.prototype);
            ConstantNode.prototype.type = "ConstantNode";
            module.exports = ConstantNode
        }, {
            "./Node": 51
        }],
        50: [function(require, module, exports) {
            var Node = require("./Node");

            function FunctionNode(name, args) {
                this.name = name;
                this.args = args
            }
            FunctionNode.prototype = Object.create(Node.prototype);
            FunctionNode.prototype.type = "FunctionNode";
            module.exports = FunctionNode
        }, {
            "./Node": 51
        }],
        51: [function(require, module, exports) {
            function Node() {}
            Node.prototype.type = "Node";
            module.exports = Node
        }, {}],
        52: [function(require, module, exports) {
            var Node = require("./Node");

            function OperatorNode(op, args) {
                this.op = op;
                this.args = args || []
            }
            OperatorNode.prototype = Object.create(Node.prototype);
            OperatorNode.prototype.type = "OperatorNode";
            module.exports = OperatorNode
        }, {
            "./Node": 51
        }],
        53: [function(require, module, exports) {
            var Node = require("./Node");

            function SymbolNode(name) {
                this.name = name
            }
            SymbolNode.prototype = Object.create(Node.prototype);
            SymbolNode.prototype.type = "SymbolNode";
            module.exports = SymbolNode
        }, {
            "./Node": 51
        }],
        54: [function(require, module, exports) {
            var Node = require("./Node");

            function UnaryNode(op, argument) {
                this.op = op;
                this.argument = argument
            }
            UnaryNode.prototype = Object.create(Node.prototype);
            UnaryNode.prototype.type = "UnaryNode";
            module.exports = UnaryNode
        }, {
            "./Node": 51
        }],
        55: [function(require, module, exports) {
            module.exports = {
                ArrayNode: require("./ArrayNode"),
                AssignmentNode: require("./AssignmentNode"),
                BlockNode: require("./BlockNode"),
                ConditionalNode: require("./ConditionalNode"),
                ConstantNode: require("./ConstantNode"),
                FunctionNode: require("./FunctionNode"),
                Node: require("./Node"),
                OperatorNode: require("./OperatorNode"),
                SymbolNode: require("./SymbolNode"),
                UnaryNode: require("./UnaryNode")
            }
        }, {
            "./ArrayNode": 45,
            "./AssignmentNode": 46,
            "./BlockNode": 47,
            "./ConditionalNode": 48,
            "./ConstantNode": 49,
            "./FunctionNode": 50,
            "./Node": 51,
            "./OperatorNode": 52,
            "./SymbolNode": 53,
            "./UnaryNode": 54
        }],
        56: [function(require, module, exports) {
            module.exports = {
                EOF: 0,
                DELIMITER: 1,
                NUMBER: 2,
                STRING: 3,
                SYMBOL: 4
            }
        }, {}],
        57: [function(require, module, exports) {
            module.exports = clamp;

            function clamp(value, min, max) {
                return min < max ? value < min ? min : value > max ? max : value : value < max ? max : value > min ? min : value
            }
        }, {}],
        58: [function(require, module, exports) {
            arguments[4][41][0].apply(exports, arguments)
        }, {
            dup: 41
        }],
        59: [function(require, module, exports) {
            "use strict";
            module.exports = Integrator;

            function adsimp(f, a, b, fa, fm, fb, V0, tol, maxdepth, depth) {
                var V, h, f1, f2, sl, sr, s2, m, V1, V2, err;
                h = b - a;
                f1 = f(a + h * .25);
                f2 = f(b - h * .25);
                sl = h * (fa + 4 * f1 + fm) / 12;
                sr = h * (fm + 4 * f2 + fb) / 12;
                s2 = sl + sr;
                err = (s2 - V0) / 15;
                if (depth > maxdepth) {
                    console.log("integrate-adaptive-simpson: Warning: maximum recursion depth (" + maxdepth + ") exceeded");
                    return s2 + err
                } else if (Math.abs(err) < tol) {
                    return s2 + err
                } else {
                    var m = a + h * .5;
                    V1 = adsimp(f, a, m, fa, f1, fm, sl, tol * .5, maxdepth, depth + 1);
                    V2 = adsimp(f, m, b, fm, f2, fb, sr, tol * .5, maxdepth, depth + 1);
                    return V1 + V2
                }
            }

            function Integrator(f, a, b, tol, maxdepth) {
                if (tol === undefined) tol = 1e-8;
                if (maxdepth === undefined) maxdepth = 20;
                var fa = f(a);
                var fm = f(.5 * (a + b));
                var fb = f(b);
                var V0 = (fa + 4 * fm + fb) * (b - a) / 6;
                return adsimp(f, a, b, fa, fm, fb, V0, tol, maxdepth, 1)
            }
        }, {}],
        60: [function(require, module, exports) {
            "use strict";
            module.exports = require("./lib/eval")
        }, {
            "./lib/eval": 62
        }],
        61: [function(require, module, exports) {
            "use strict";
            module.exports = function(ns) {
                ns.mod = ns.fmod;
                ns.lessThan = ns.lt;
                ns.lessEqualThan = ns.leq;
                ns.greaterThan = ns.gt;
                ns.greaterEqualThan = ns.geq;
                ns.strictlyEqual = ns.equal;
                ns.strictlyNotEqual = ns.notEqual;
                ns.logicalAND = function(a, b) {
                    return a && b
                };
                ns.logicalXOR = function(a, b) {
                    return a ^ b
                };
                ns.logicalOR = function(a, b) {
                    return a || b
                }
            }
        }, {}],
        62: [function(require, module, exports) {
            "use strict";
            var CodeGenerator = require("math-codegen");
            var Interval = require("interval-arithmetic");
            require("./adapter")(Interval);

            function processScope(scope) {
                Object.keys(scope).forEach(function(k) {
                    var value = scope[k];
                    if (typeof value === "number" || Array.isArray(value)) {
                        scope[k] = Interval.factory(value)
                    } else if (typeof value === "object" && "lo" in value && "hi" in value) {
                        scope[k] = Interval.factory(value.lo, value.hi)
                    }
                })
            }
            module.exports = function(expression) {
                return (new CodeGenerator).setDefs({
                    $$processScope: processScope
                }).parse(expression).compile(Interval)
            };
            module.exports.policies = require("./policies")(Interval);
            module.exports.Interval = Interval
        }, {
            "./adapter": 61,
            "./policies": 63,
            "interval-arithmetic": 64,
            "math-codegen": 78
        }],
        63: [function(require, module, exports) {
            "use strict";
            module.exports = function(Interval) {
                return {
                    disableRounding: function() {
                        Interval.rmath.disable()
                    },
                    enableRounding: function() {
                        Interval.rmath.enable()
                    }
                }
            }
        }, {}],
        64: [function(require, module, exports) {
            "use strict";

            function shallowExtend() {
                var dest = arguments[0];
                var p;
                for (var i = 1; i < arguments.length; i += 1) {
                    for (p in arguments[i]) {
                        if (arguments[i].hasOwnProperty(p)) {
                            dest[p] = arguments[i][p]
                        }
                    }
                }
            }
            require("./lib/polyfill");
            module.exports = require("./lib/interval");
            module.exports.rmath = require("./lib/round-math");
            module.exports.double = require("./lib/double");
            shallowExtend(module.exports, require("./lib/constants"), require("./lib/operations/relational"), require("./lib/operations/arithmetic"), require("./lib/operations/algebra"), require("./lib/operations/trigonometric"), require("./lib/operations/misc"), require("./lib/operations/utils"))
        }, {
            "./lib/constants": 65,
            "./lib/double": 66,
            "./lib/interval": 67,
            "./lib/operations/algebra": 68,
            "./lib/operations/arithmetic": 69,
            "./lib/operations/misc": 71,
            "./lib/operations/relational": 72,
            "./lib/operations/trigonometric": 73,
            "./lib/operations/utils": 74,
            "./lib/polyfill": 75,
            "./lib/round-math": 76
        }],
        65: [function(require, module, exports) {
            "use strict";
            var Interval = require("./interval");
            var piLow = (3373259426 + 273688 / (1 << 21)) / (1 << 30);
            var piHigh = (3373259426 + 273689 / (1 << 21)) / (1 << 30);
            var constants = {};
            constants.PI_LOW = piLow;
            constants.PI_HIGH = piHigh;
            constants.PI_HALF_LOW = piLow / 2;
            constants.PI_HALF_HIGH = piHigh / 2;
            constants.PI_TWICE_LOW = piLow * 2;
            constants.PI_TWICE_HIGH = piHigh * 2;
            constants.PI = new Interval(piLow, piHigh);
            constants.PI_HALF = new Interval(constants.PI_HALF_LOW, constants.PI_HALF_HIGH);
            constants.PI_TWICE = new Interval(constants.PI_TWICE_LOW, constants.PI_TWICE_HIGH);
            constants.ZERO = new Interval(0, 0);
            constants.ONE = new Interval(1, 1);
            constants.WHOLE = (new Interval).setWhole();
            constants.EMPTY = (new Interval).setEmpty();
            module.exports = constants
        }, {
            "./interval": 67
        }],
        66: [function(require, module, exports) {
            (function(global) {
                "use strict";
                var TA = require("typedarray");

                function defineFromPolyfill(property) {
                    if (!global[property]) {
                        global[property] = TA[property]
                    }
                }
                defineFromPolyfill("Uint8Array");
                defineFromPolyfill("ArrayBuffer");
                defineFromPolyfill("DataView");
                var buffer = new ArrayBuffer(8);
                var dv = new DataView(buffer);
                var array8 = new Uint8Array(buffer);

                function float64ToOctets(number) {
                    dv.setFloat64(0, number, false);
                    return [].slice.call(new Uint8Array(buffer))
                }

                function octetsToFloat64(octets) {
                    array8.set(octets);
                    return dv.getFloat64(0, false)
                }

                function add(bytes, n) {
                    for (var i = 7; i >= 0; i -= 1) {
                        bytes[i] += n;
                        if (bytes[i] === 256) {
                            n = 1;
                            bytes[i] = 0
                        } else if (bytes[i] === -1) {
                            n = -1;
                            bytes[i] = 255
                        } else {
                            n = 0
                        }
                    }
                }

                function solve(a, b) {
                    if (a === Number.POSITIVE_INFINITY || a === Number.NEGATIVE_INFINITY || isNaN(a)) {
                        return a
                    }
                    var bytes = float64ToOctets(a);
                    add(bytes, b);
                    return octetsToFloat64(bytes)
                }
                exports.doubleToOctetArray = float64ToOctets;
                exports.ieee754NextDouble = function(n) {
                    return solve(n, 1)
                };
                exports.ieee754PrevDouble = function(n) {
                    return solve(n, -1)
                }
            }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
        }, {
            typedarray: 77
        }],
        67: [function(require, module, exports) {
            "use strict";
            var utils = require("./operations/utils");
            var rmath = require("./round-math");

            function Interval(lo, hi) {
                switch (arguments.length) {
                    case 1:
                        if (typeof lo !== "number") {
                            throw new TypeError("lo must be a number")
                        }
                        this.set(lo, lo);
                        if (isNaN(lo)) {
                            this.setEmpty()
                        }
                        break;
                    case 2:
                        if (typeof lo !== "number" || typeof hi !== "number") {
                            throw new TypeError("lo,hi must be numbers")
                        }
                        this.set(lo, hi);
                        if (isNaN(lo) || isNaN(hi) || lo > hi) {
                            this.setEmpty()
                        }
                        break;
                    default:
                        this.lo = 0;
                        this.hi = 0;
                        break
                }
            }
            Interval.factory = function(a, b) {
                function assert(a, message) {
                    if (!a) {
                        throw new Error(message || "assertion failed")
                    }
                }

                function singleton(x) {
                    if (typeof x === "object") {
                        assert(typeof x.lo === "number" && typeof x.hi === "number", "param must be an Interval");
                        assert(utils.singleton(x), "param needs to be a singleton")
                    }
                }

                function getNumber(x) {
                    if (typeof x === "object") {
                        singleton(x);
                        return x.lo
                    }
                    return x
                }
                assert(arguments.length <= 2);
                var lo, hi;
                if (arguments.length === 2) {
                    lo = getNumber(a);
                    hi = getNumber(b)
                } else if (arguments.length === 1) {
                    if (Array.isArray(a)) {
                        lo = a[0];
                        hi = a[1]
                    } else {
                        lo = hi = getNumber(a)
                    }
                } else {
                    return new Interval
                }
                return new Interval(lo, hi)
            };
            Interval.prototype.singleton = function(v) {
                return this.set(v, v)
            };
            Interval.prototype.bounded = function(lo, hi) {
                return this.set(rmath.prev(lo), rmath.next(hi))
            };
            Interval.prototype.boundedSingleton = function(v) {
                return this.bounded(v, v)
            };
            Interval.prototype.set = function(lo, hi) {
                this.lo = lo;
                this.hi = hi;
                return this
            };
            Interval.prototype.assign = function(lo, hi) {
                if (isNaN(lo) || isNaN(hi) || lo > hi) {
                    return this.setEmpty()
                }
                return this.set(lo, hi)
            };
            Interval.prototype.setEmpty = function() {
                return this.set(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY)
            };
            Interval.prototype.setWhole = function() {
                return this.set(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
            };
            Interval.prototype.toArray = function() {
                return [this.lo, this.hi]
            };
            module.exports = Interval
        }, {
            "./operations/utils": 74,
            "./round-math": 76
        }],
        68: [function(require, module, exports) {
            "use strict";
            var Interval = require("../interval");
            var rmath = require("../round-math");
            var utils = require("./utils");
            var arithmetic = require("./arithmetic");
            var constants = require("../constants");
            var algebra = {};
            algebra.fmod = function(x, y) {
                if (utils.empty(x) || utils.empty(y)) {
                    return constants.EMPTY
                }
                var yb = x.lo < 0 ? y.lo : y.hi;
                var n = rmath.intLo(rmath.divLo(x.lo, yb));
                return arithmetic.sub(x, arithmetic.mul(y, new Interval(n, n)))
            };
            algebra.multiplicativeInverse = function(x) {
                if (utils.empty(x)) {
                    return constants.EMPTY
                }
                if (utils.zeroIn(x)) {
                    if (x.lo !== 0) {
                        if (x.hi !== 0) {
                            return constants.WHOLE
                        } else {
                            return new Interval(Number.NEGATIVE_INFINITY, rmath.divHi(1, x.lo))
                        }
                    } else {
                        if (x.hi !== 0) {
                            return new Interval(rmath.divLo(1, x.hi), Number.POSITIVE_INFINITY)
                        } else {
                            return constants.EMPTY
                        }
                    }
                } else {
                    return new Interval(rmath.divLo(1, x.hi), rmath.divHi(1, x.lo))
                }
            };
            algebra.pow = function(x, power) {
                if (utils.empty(x)) {
                    return constants.EMPTY
                }
                if (typeof power === "object") {
                    if (!utils.singleton(power)) {
                        return constants.EMPTY
                    }
                    power = power.lo
                }
                if (power === 0) {
                    if (x.lo === 0 && x.hi === 0) {
                        return constants.EMPTY
                    } else {
                        return constants.ONE
                    }
                } else if (power < 0) {
                    return algebra.multiplicativeInverse(algebra.pow(x, -power))
                }
                if (x.hi < 0) {
                    var yl = rmath.powLo(-x.hi, power);
                    var yh = rmath.powHi(-x.lo, power);
                    if (power & 1) {
                        return new Interval(-yh, -yl)
                    } else {
                        return new Interval(yl, yh)
                    }
                } else if (x.lo < 0) {
                    if (power & 1) {
                        return new Interval(-rmath.powLo(-x.lo, power), rmath.powHi(x.hi, power))
                    } else {
                        return new Interval(0, rmath.powHi(Math.max(-x.lo, x.hi), power))
                    }
                } else {
                    return new Interval(rmath.powLo(x.lo, power), rmath.powHi(x.hi, power))
                }
            };
            algebra.sqrt = function(x) {
                if (utils.empty(x) || x.hi < 0) {
                    return constants.EMPTY
                }
                var t = x.lo <= 0 ? 0 : rmath.sqrtLo(x.lo);
                return new Interval(t, rmath.sqrtHi(x.hi))
            };
            module.exports = algebra
        }, {
            "../constants": 65,
            "../interval": 67,
            "../round-math": 76,
            "./arithmetic": 69,
            "./utils": 74
        }],
        69: [function(require, module, exports) {
            "use strict";
            var Interval = require("../interval");
            var rmath = require("../round-math");
            var utils = require("./utils");
            var constants = require("../constants");
            var division = require("./division");
            var arithmetic = {};
            arithmetic.add = function(a, b) {
                return new Interval(rmath.addLo(a.lo, b.lo), rmath.addHi(a.hi, b.hi))
            };
            arithmetic.sub = function(a, b) {
                return new Interval(rmath.subLo(a.lo, b.hi), rmath.subHi(a.hi, b.lo))
            };
            arithmetic.mul = function(a, b) {
                if (utils.empty(a) || utils.empty(b)) {
                    return constants.EMPTY
                }
                var al = a.lo;
                var ah = a.hi;
                var bl = b.lo;
                var bh = b.hi;
                var out = new Interval;
                if (al < 0) {
                    if (ah > 0) {
                        if (bl < 0) {
                            if (bh > 0) {
                                out.lo = Math.min(rmath.mulLo(al, bh), rmath.mulLo(ah, bl));
                                out.hi = Math.max(rmath.mulHi(al, bl), rmath.mulHi(ah, bh))
                            } else {
                                out.lo = rmath.mulLo(ah, bl);
                                out.hi = rmath.mulHi(al, bl)
                            }
                        } else {
                            if (bh > 0) {
                                out.lo = rmath.mulLo(al, bh);
                                out.hi = rmath.mulHi(ah, bh)
                            } else {
                                out.lo = 0;
                                out.hi = 0
                            }
                        }
                    } else {
                        if (bl < 0) {
                            if (bh > 0) {
                                out.lo = rmath.mulLo(al, bh);
                                out.hi = rmath.mulHi(al, bl)
                            } else {
                                out.lo = rmath.mulLo(ah, bh);
                                out.hi = rmath.mulHi(al, bl)
                            }
                        } else {
                            if (bh > 0) {
                                out.lo = rmath.mulLo(al, bh);
                                out.hi = rmath.mulHi(ah, bl)
                            } else {
                                out.lo = 0;
                                out.hi = 0
                            }
                        }
                    }
                } else {
                    if (ah > 0) {
                        if (bl < 0) {
                            if (bh > 0) {
                                out.lo = rmath.mulLo(ah, bl);
                                out.hi = rmath.mulHi(ah, bh)
                            } else {
                                out.lo = rmath.mulLo(ah, bl);
                                out.hi = rmath.mulHi(al, bh)
                            }
                        } else {
                            if (bh > 0) {
                                out.lo = rmath.mulLo(al, bl);
                                out.hi = rmath.mulHi(ah, bh)
                            } else {
                                out.lo = 0;
                                out.hi = 0
                            }
                        }
                    } else {
                        out.lo = 0;
                        out.hi = 0
                    }
                }
                return out
            };
            arithmetic.div = function(a, b) {
                if (utils.empty(a) || utils.empty(b)) {
                    return constants.EMPTY
                }
                if (utils.zeroIn(b)) {
                    if (b.lo !== 0) {
                        if (b.hi !== 0) {
                            return division.zero(a)
                        } else {
                            return division.negative(a, b.lo)
                        }
                    } else {
                        if (b.hi !== 0) {
                            return division.positive(a, b.hi)
                        } else {
                            return constants.EMPTY
                        }
                    }
                } else {
                    return division.nonZero(a, b)
                }
            };
            arithmetic.positive = function(a) {
                return new Interval(a.lo, a.hi)
            };
            arithmetic.negative = function(a) {
                return new Interval(-a.hi, -a.lo)
            };
            module.exports = arithmetic
        }, {
            "../constants": 65,
            "../interval": 67,
            "../round-math": 76,
            "./division": 70,
            "./utils": 74
        }],
        70: [function(require, module, exports) {
            "use strict";
            var Interval = require("../interval");
            var rmath = require("../round-math");
            var utils = require("./utils");
            var constants = require("../constants");
            var division = {
                nonZero: function(x, y) {
                    var xl = x.lo;
                    var xh = x.hi;
                    var yl = y.lo;
                    var yh = y.hi;
                    var out = new Interval;
                    if (xh < 0) {
                        if (yh < 0) {
                            out.lo = rmath.divLo(xh, yl);
                            out.hi = rmath.divHi(xl, yh)
                        } else {
                            out.lo = rmath.divLo(xl, yl);
                            out.hi = rmath.divHi(xh, yh)
                        }
                    } else if (xl < 0) {
                        if (yh < 0) {
                            out.lo = rmath.divLo(xh, yh);
                            out.hi = rmath.divHi(xl, yh)
                        } else {
                            out.lo = rmath.divLo(xl, yl);
                            out.hi = rmath.divHi(xh, yl)
                        }
                    } else {
                        if (yh < 0) {
                            out.lo = rmath.divLo(xh, yh);
                            out.hi = rmath.divHi(xl, yl)
                        } else {
                            out.lo = rmath.divLo(xl, yh);
                            out.hi = rmath.divHi(xh, yl)
                        }
                    }
                    return out
                },
                positive: function(x, v) {
                    if (x.lo === 0 && x.hi === 0) {
                        return x
                    }
                    if (utils.zeroIn(x)) {
                        return constants.WHOLE
                    }
                    if (x.hi < 0) {
                        return new Interval(Number.NEGATIVE_INFINITY, rmath.divHi(x.hi, v))
                    } else {
                        return new Interval(rmath.divLo(x.lo, v), Number.POSITIVE_INFINITY)
                    }
                },
                negative: function(x, v) {
                    if (x.lo === 0 && x.hi === 0) {
                        return x
                    }
                    if (utils.zeroIn(x)) {
                        return constants.WHOLE
                    }
                    if (x.hi < 0) {
                        return new Interval(rmath.divLo(x.hi, v), Number.POSITIVE_INFINITY)
                    } else {
                        return new Interval(Number.NEGATIVE_INFINITY, rmath.divHi(x.lo, v))
                    }
                },
                zero: function(x) {
                    if (x.lo === 0 && x.hi === 0) {
                        return x
                    }
                    return constants.WHOLE
                }
            };
            module.exports = division
        }, {
            "../constants": 65,
            "../interval": 67,
            "../round-math": 76,
            "./utils": 74
        }],
        71: [function(require, module, exports) {
            "use strict";
            var constants = require("../constants");
            var Interval = require("../interval");
            var rmath = require("../round-math");
            var utils = require("./utils");
            var arithmetic = require("./arithmetic");
            var misc = {};
            misc.exp = function(x) {
                if (utils.empty(x)) {
                    return constants.EMPTY
                }
                return new Interval(rmath.expLo(x.lo), rmath.expHi(x.hi))
            };
            misc.log = function(x) {
                if (utils.empty(x)) {
                    return constants.EMPTY
                }
                var l = x.lo <= 0 ? Number.NEGATIVE_INFINITY : rmath.logLo(x.lo);
                return new Interval(l, rmath.logHi(x.hi))
            };
            misc.ln = misc.log;
            misc.LOG_EXP_10 = misc.log(new Interval(10, 10));
            misc.log10 = function(x) {
                if (utils.empty(x)) {
                    return constants.EMPTY
                }
                return arithmetic.div(misc.log(x), misc.LOG_EXP_10)
            };
            misc.LOG_EXP_2 = misc.log(new Interval(2, 2));
            misc.log2 = function(x) {
                if (utils.empty(x)) {
                    return constants.EMPTY
                }
                return arithmetic.div(misc.log(x), misc.LOG_EXP_2)
            };
            misc.hull = function(x, y) {
                var badX = utils.empty(x);
                var badY = utils.empty(y);
                if (badX) {
                    if (badY) {
                        return constants.EMPTY
                    } else {
                        return y
                    }
                } else {
                    if (badY) {
                        return x
                    } else {
                        return new Interval(Math.min(x.lo, y.lo), Math.max(x.hi, y.hi))
                    }
                }
            };
            misc.intersect = function(x, y) {
                if (utils.empty(x) || utils.empty(y)) {
                    return constants.EMPTY
                }
                var lo = Math.max(x.lo, y.lo);
                var hi = Math.min(x.hi, y.hi);
                if (lo <= hi) {
                    return new Interval(lo, hi)
                }
                return constants.EMPTY
            };
            misc.abs = function(x) {
                if (utils.empty(x)) {
                    return constants.EMPTY
                }
                if (x.lo >= 0) {
                    return x
                }
                if (x.hi <= 0) {
                    return arithmetic.negative(x)
                }
                return new Interval(0, Math.max(-x.lo, x.hi))
            };
            misc.max = function(x, y) {
                if (utils.empty(x)) {
                    return constants.EMPTY
                }
                return new Interval(Math.max(x.lo, y.lo), Math.max(x.hi, y.hi))
            };
            misc.min = function(x, y) {
                if (utils.empty(x)) {
                    return constants.EMPTY
                }
                return new Interval(Math.min(x.lo, y.lo), Math.min(x.hi, y.hi))
            };
            misc.clone = function(x) {
                return (new Interval).set(x.lo, x.hi)
            };
            module.exports = misc
        }, {
            "../constants": 65,
            "../interval": 67,
            "../round-math": 76,
            "./arithmetic": 69,
            "./utils": 74
        }],
        72: [function(require, module, exports) {
            "use strict";
            var utils = require("./utils");
            var relational = {};
            relational.equal = function(x, y) {
                if (utils.empty(x)) {
                    return utils.empty(y)
                }
                return !utils.empty(y) && x.lo === y.lo && x.hi === y.hi
            };
            relational.almostEqual = function(x, y) {
                var EPS = 1e-7;

                function assert(a, message) {
                    if (!a) {
                        throw new Error(message || "assertion failed")
                    }
                }

                function assertEps(a, b) {
                    assert(Math.abs(a - b) < EPS)
                }
                x = Array.isArray(x) ? x : x.toArray();
                y = Array.isArray(y) ? y : y.toArray();
                assertEps(x[0], y[0]);
                assertEps(x[1], y[1]);
                assert(x[0] <= x[1], "interval must not be empty")
            };
            relational.notEqual = function(x, y) {
                if (utils.empty(x)) {
                    return !utils.empty(y)
                }
                return utils.empty(y) || x.hi < y.lo || x.lo > y.hi
            };
            relational.lt = function(x, y) {
                if (utils.empty(x) || utils.empty(y)) {
                    return false
                }
                return x.hi < y.lo
            };
            relational.gt = function(x, y) {
                if (utils.empty(x) || utils.empty(y)) {
                    return false
                }
                return x.lo > y.hi
            };
            relational.leq = function(x, y) {
                if (utils.empty(x) || utils.empty(y)) {
                    return false
                }
                return x.hi <= y.lo
            };
            relational.geq = function(x, y) {
                if (utils.empty(x) || utils.empty(y)) {
                    return false
                }
                return x.lo >= y.hi
            };
            module.exports = relational
        }, {
            "./utils": 74
        }],
        73: [function(require, module, exports) {
            "use strict";
            var constants = require("../constants");
            var Interval = require("../interval");
            var rmath = require("../round-math");
            var utils = require("./utils");
            var algebra = require("./algebra");
            var arithmetic = require("./arithmetic");
            var trigonometric = {};
            trigonometric.cos = function(x) {
                var rlo, rhi;
                if (utils.empty(x)) {
                    return constants.EMPTY
                }
                if (x.lo < 0) {
                    var mult = 1e7;
                    x.lo += 2 * Math.PI * mult;
                    x.hi += 2 * Math.PI * mult
                }
                var pi2 = constants.PI_TWICE;
                var t = algebra.fmod(x, pi2);
                if (utils.width(t) >= pi2.lo) {
                    return new Interval(-1, 1)
                }
                if (t.lo >= constants.PI_HIGH) {
                    var cos = trigonometric.cos(arithmetic.sub(t, constants.PI));
                    return arithmetic.negative(cos)
                }
                var lo = t.lo;
                var hi = t.hi;
                rlo = rmath.cosLo(hi);
                rhi = rmath.cosHi(lo);
                if (hi <= constants.PI_LOW) {
                    return new Interval(rlo, rhi)
                } else if (hi <= pi2.lo) {
                    return new Interval(-1, Math.max(rlo, rhi))
                } else {
                    return new Interval(-1, 1)
                }
            };
            trigonometric.sin = function(x) {
                if (utils.empty(x)) {
                    return constants.EMPTY
                }
                return trigonometric.cos(arithmetic.sub(x, constants.PI_HALF))
            };
            trigonometric.tan = function(x) {
                if (utils.empty(x)) {
                    return constants.EMPTY
                }
                if (x.lo < 0) {
                    var mult = 1e7;
                    x.lo += 2 * Math.PI * mult;
                    x.hi += 2 * Math.PI * mult
                }
                var pi = constants.PI;
                var t = algebra.fmod(x, pi);
                if (t.lo >= constants.PI_HALF_LOW) {
                    t = arithmetic.sub(t, pi)
                }
                if (t.lo <= -constants.PI_HALF_LOW || t.hi >= constants.PI_HALF_LOW) {
                    return constants.WHOLE
                }
                return new Interval(rmath.tanLo(t.lo), rmath.tanHi(t.hi))
            };
            trigonometric.asin = function(x) {
                if (utils.empty(x) || x.hi < -1 || x.lo > 1) {
                    return constants.EMPTY
                }
                var lo = x.lo <= -1 ? -constants.PI_HALF_HIGH : rmath.asinLo(x.lo);
                var hi = x.hi >= 1 ? constants.PI_HALF_HIGH : rmath.asinHi(x.hi);
                return new Interval(lo, hi)
            };
            trigonometric.acos = function(x) {
                if (utils.empty(x) || x.hi < -1 || x.lo > 1) {
                    return constants.EMPTY
                }
                var lo = x.hi >= 1 ? 0 : rmath.acosLo(x.hi);
                var hi = x.lo <= -1 ? constants.PI_HIGH : rmath.acosHi(x.lo);
                return new Interval(lo, hi)
            };
            trigonometric.atan = function(x) {
                if (utils.empty(x)) {
                    return constants.EMPTY
                }
                return new Interval(rmath.atanLo(x.lo), rmath.atanHi(x.hi))
            };
            trigonometric.sinh = function(x) {
                if (utils.empty(x)) {
                    return constants.EMPTY
                }
                return new Interval(rmath.sinhLo(x.lo), rmath.sinhHi(x.hi))
            };
            trigonometric.cosh = function(x) {
                if (utils.empty(x)) {
                    return constants.EMPTY
                }
                if (x.hi < 0) {
                    return new Interval(rmath.coshLo(x.hi), rmath.coshHi(x.lo))
                } else if (x.lo >= 0) {
                    return new Interval(rmath.coshLo(x.lo), rmath.coshHi(x.hi))
                } else {
                    return new Interval(1, rmath.coshHi(-x.lo > x.hi ? x.lo : x.hi))
                }
            };
            trigonometric.tanh = function(x) {
                if (utils.empty(x)) {
                    return constants.EMPTY
                }
                return new Interval(rmath.tanhLo(x.lo), rmath.tanhHi(x.hi))
            };
            module.exports = trigonometric
        }, {
            "../constants": 65,
            "../interval": 67,
            "../round-math": 76,
            "./algebra": 68,
            "./arithmetic": 69,
            "./utils": 74
        }],
        74: [function(require, module, exports) {
            "use strict";
            var rmath = require("../round-math");
            var utils = {};
            utils.empty = function(a) {
                return a.lo > a.hi
            };
            utils.whole = function(a) {
                return a.lo === -Infinity && a.hi === Infinity
            };
            utils.zeroIn = function(a) {
                return utils.in(a, 0)
            };
            utils.in = function(a, v) {
                if (utils.empty(a)) {
                    return false
                }
                return a.lo <= v && v <= a.hi
            };
            utils.subset = function(a, b) {
                if (utils.empty(a)) {
                    return true
                }
                return !utils.empty(b) && b.lo <= a.lo && a.hi <= b.hi
            };
            utils.overlap = function(a, b) {
                if (utils.empty(a) || utils.empty(b)) {
                    return false
                }
                return a.lo <= b.lo && b.lo <= a.hi || b.lo <= a.lo && a.lo <= b.hi
            };
            utils.singleton = function(x) {
                return !utils.empty(x) && x.lo === x.hi
            };
            utils.width = function(x) {
                if (utils.empty(x)) {
                    return 0
                }
                return rmath.subHi(x.hi, x.lo)
            };
            module.exports = utils
        }, {
            "../round-math": 76
        }],
        75: [function(require, module, exports) {
            "use strict";
            Math.sinh = Math.sinh || function(x) {
                var y = Math.exp(x);
                return (y - 1 / y) / 2
            };
            Math.cosh = Math.cosh || function(x) {
                var y = Math.exp(x);
                return (y + 1 / y) / 2
            };
            Math.tanh = Math.tanh || function(x) {
                if (x === Number.POSITIVE_INFINITY) {
                    return 1
                } else if (x === Number.NEGATIVE_INFINITY) {
                    return -1
                } else {
                    var y = Math.exp(2 * x);
                    return (y - 1) / (y + 1)
                }
            }
        }, {}],
        76: [function(require, module, exports) {
            "use strict";
            var double = require("./double");
            var round = {};
            var MIN_VALUE = double.ieee754NextDouble(0);
            round.POSITIVE_ZERO = +0;
            round.NEGATIVE_ZERO = -0;
            var oldNext;
            var next = oldNext = round.next = function(v) {
                if (v === 0) {
                    return MIN_VALUE
                }
                if (Math.abs(v) < Number.POSITIVE_INFINITY) {
                    if (v > 0) {
                        return double.ieee754NextDouble(v)
                    } else {
                        return double.ieee754PrevDouble(v)
                    }
                }
                return v
            };
            var oldPrev;
            var prev = oldPrev = round.prev = function(v) {
                return -next(-v)
            };
            round.addLo = function(x, y) {
                return prev(x + y)
            };
            round.addHi = function(x, y) {
                return next(x + y)
            };
            round.subLo = function(x, y) {
                return prev(x - y)
            };
            round.subHi = function(x, y) {
                return next(x - y)
            };
            round.mulLo = function(x, y) {
                return prev(x * y)
            };
            round.mulHi = function(x, y) {
                return next(x * y)
            };
            round.divLo = function(x, y) {
                return prev(x / y)
            };
            round.divHi = function(x, y) {
                return next(x / y)
            };

            function toInteger(x) {
                return x < 0 ? Math.ceil(x) : Math.floor(x)
            }
            round.intLo = function(x) {
                return toInteger(prev(x))
            };
            round.intHi = function(x) {
                return toInteger(next(x))
            };
            round.logLo = function(x) {
                return prev(Math.log(x))
            };
            round.logHi = function(x) {
                return next(Math.log(x))
            };
            round.expLo = function(x) {
                return prev(Math.exp(x))
            };
            round.expHi = function(x) {
                return next(Math.exp(x))
            };
            round.sinLo = function(x) {
                return prev(Math.sin(x))
            };
            round.sinHi = function(x) {
                return next(Math.sin(x))
            };
            round.cosLo = function(x) {
                return prev(Math.cos(x))
            };
            round.cosHi = function(x) {
                return next(Math.cos(x))
            };
            round.tanLo = function(x) {
                return prev(Math.tan(x))
            };
            round.tanHi = function(x) {
                return next(Math.tan(x))
            };
            round.asinLo = function(x) {
                return prev(Math.asin(x))
            };
            round.asinHi = function(x) {
                return next(Math.asin(x))
            };
            round.acosLo = function(x) {
                return prev(Math.acos(x))
            };
            round.acosHi = function(x) {
                return next(Math.acos(x))
            };
            round.atanLo = function(x) {
                return prev(Math.atan(x))
            };
            round.atanHi = function(x) {
                return next(Math.atan(x))
            };
            round.sinhLo = function(x) {
                return prev(Math.sinh(x))
            };
            round.sinhHi = function(x) {
                return next(Math.sinh(x))
            };
            round.coshLo = function(x) {
                return prev(Math.cosh(x))
            };
            round.coshHi = function(x) {
                return next(Math.cosh(x))
            };
            round.tanhLo = function(x) {
                return prev(Math.tanh(x))
            };
            round.tanhHi = function(x) {
                return next(Math.tanh(x))
            };
            round.powLo = function(x, power) {
                if (power % 1 !== 0) {
                    return prev(Math.pow(x, power))
                }
                var y = power & 1 ? x : 1;
                power >>= 1;
                while (power > 0) {
                    x = round.mulLo(x, x);
                    if (power & 1) {
                        y = round.mulLo(x, y)
                    }
                    power >>= 1
                }
                return y
            };
            round.powHi = function(x, power) {
                if (power % 1 !== 0) {
                    return next(Math.pow(x, power))
                }
                var y = power & 1 ? x : 1;
                power >>= 1;
                while (power > 0) {
                    x = round.mulHi(x, x);
                    if (power & 1) {
                        y = round.mulHi(x, y)
                    }
                    power >>= 1
                }
                return y
            };
            round.sqrtLo = function(x) {
                return prev(Math.sqrt(x))
            };
            round.sqrtHi = function(x) {
                return next(Math.sqrt(x))
            };
            round.disable = function() {
                next = prev = round.next = round.prev = function(v) {
                    return v
                }
            };
            round.enable = function() {
                prev = round.prev = oldPrev;
                next = round.next = oldNext
            };
            module.exports = round
        }, {
            "./double": 66
        }],
        77: [function(require, module, exports) {
            var undefined = void 0;
            var MAX_ARRAY_LENGTH = 1e5;
            var ECMAScript = function() {
                var opts = Object.prototype.toString,
                    ophop = Object.prototype.hasOwnProperty;
                return {
                    Class: function(v) {
                        return opts.call(v).replace(/^\[object *|\]$/g, "")
                    },
                    HasProperty: function(o, p) {
                        return p in o
                    },
                    HasOwnProperty: function(o, p) {
                        return ophop.call(o, p)
                    },
                    IsCallable: function(o) {
                        return typeof o === "function"
                    },
                    ToInt32: function(v) {
                        return v >> 0
                    },
                    ToUint32: function(v) {
                        return v >>> 0
                    }
                }
            }();
            var LN2 = Math.LN2,
                abs = Math.abs,
                floor = Math.floor,
                log = Math.log,
                min = Math.min,
                pow = Math.pow,
                round = Math.round;

            function configureProperties(obj) {
                if (getOwnPropNames && defineProp) {
                    var props = getOwnPropNames(obj),
                        i;
                    for (i = 0; i < props.length; i += 1) {
                        defineProp(obj, props[i], {
                            value: obj[props[i]],
                            writable: false,
                            enumerable: false,
                            configurable: false
                        })
                    }
                }
            }
            var defineProp;
            if (Object.defineProperty && function() {
                    try {
                        Object.defineProperty({}, "x", {});
                        return true
                    } catch (e) {
                        return false
                    }
                }()) {
                defineProp = Object.defineProperty
            } else {
                defineProp = function(o, p, desc) {
                    if (!o === Object(o)) throw new TypeError("Object.defineProperty called on non-object");
                    if (ECMAScript.HasProperty(desc, "get") && Object.prototype.__defineGetter__) {
                        Object.prototype.__defineGetter__.call(o, p, desc.get)
                    }
                    if (ECMAScript.HasProperty(desc, "set") && Object.prototype.__defineSetter__) {
                        Object.prototype.__defineSetter__.call(o, p, desc.set)
                    }
                    if (ECMAScript.HasProperty(desc, "value")) {
                        o[p] = desc.value
                    }
                    return o
                }
            }
            var getOwnPropNames = Object.getOwnPropertyNames || function(o) {
                    if (o !== Object(o)) throw new TypeError("Object.getOwnPropertyNames called on non-object");
                    var props = [],
                        p;
                    for (p in o) {
                        if (ECMAScript.HasOwnProperty(o, p)) {
                            props.push(p)
                        }
                    }
                    return props
                };

            function makeArrayAccessors(obj) {
                if (!defineProp) {
                    return
                }
                if (obj.length > MAX_ARRAY_LENGTH) throw new RangeError("Array too large for polyfill");

                function makeArrayAccessor(index) {
                    defineProp(obj, index, {
                        get: function() {
                            return obj._getter(index)
                        },
                        set: function(v) {
                            obj._setter(index, v)
                        },
                        enumerable: true,
                        configurable: false
                    })
                }
                var i;
                for (i = 0; i < obj.length; i += 1) {
                    makeArrayAccessor(i)
                }
            }

            function as_signed(value, bits) {
                var s = 32 - bits;
                return value << s >> s
            }

            function as_unsigned(value, bits) {
                var s = 32 - bits;
                return value << s >>> s
            }

            function packI8(n) {
                return [n & 255]
            }

            function unpackI8(bytes) {
                return as_signed(bytes[0], 8)
            }

            function packU8(n) {
                return [n & 255]
            }

            function unpackU8(bytes) {
                return as_unsigned(bytes[0], 8)
            }

            function packU8Clamped(n) {
                n = round(Number(n));
                return [n < 0 ? 0 : n > 255 ? 255 : n & 255]
            }

            function packI16(n) {
                return [n >> 8 & 255, n & 255]
            }

            function unpackI16(bytes) {
                return as_signed(bytes[0] << 8 | bytes[1], 16)
            }

            function packU16(n) {
                return [n >> 8 & 255, n & 255]
            }

            function unpackU16(bytes) {
                return as_unsigned(bytes[0] << 8 | bytes[1], 16)
            }

            function packI32(n) {
                return [n >> 24 & 255, n >> 16 & 255, n >> 8 & 255, n & 255]
            }

            function unpackI32(bytes) {
                return as_signed(bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], 32)
            }

            function packU32(n) {
                return [n >> 24 & 255, n >> 16 & 255, n >> 8 & 255, n & 255]
            }

            function unpackU32(bytes) {
                return as_unsigned(bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], 32)
            }

            function packIEEE754(v, ebits, fbits) {
                var bias = (1 << ebits - 1) - 1,
                    s, e, f, ln, i, bits, str, bytes;

                function roundToEven(n) {
                    var w = floor(n),
                        f = n - w;
                    if (f < .5) return w;
                    if (f > .5) return w + 1;
                    return w % 2 ? w + 1 : w
                }
                if (v !== v) {
                    e = (1 << ebits) - 1;
                    f = pow(2, fbits - 1);
                    s = 0
                } else if (v === Infinity || v === -Infinity) {
                    e = (1 << ebits) - 1;
                    f = 0;
                    s = v < 0 ? 1 : 0
                } else if (v === 0) {
                    e = 0;
                    f = 0;
                    s = 1 / v === -Infinity ? 1 : 0
                } else {
                    s = v < 0;
                    v = abs(v);
                    if (v >= pow(2, 1 - bias)) {
                        e = min(floor(log(v) / LN2), 1023);
                        f = roundToEven(v / pow(2, e) * pow(2, fbits));
                        if (f / pow(2, fbits) >= 2) {
                            e = e + 1;
                            f = 1
                        }
                        if (e > bias) {
                            e = (1 << ebits) - 1;
                            f = 0
                        } else {
                            e = e + bias;
                            f = f - pow(2, fbits)
                        }
                    } else {
                        e = 0;
                        f = roundToEven(v / pow(2, 1 - bias - fbits))
                    }
                }
                bits = [];
                for (i = fbits; i; i -= 1) {
                    bits.push(f % 2 ? 1 : 0);
                    f = floor(f / 2)
                }
                for (i = ebits; i; i -= 1) {
                    bits.push(e % 2 ? 1 : 0);
                    e = floor(e / 2)
                }
                bits.push(s ? 1 : 0);
                bits.reverse();
                str = bits.join("");
                bytes = [];
                while (str.length) {
                    bytes.push(parseInt(str.substring(0, 8), 2));
                    str = str.substring(8)
                }
                return bytes
            }

            function unpackIEEE754(bytes, ebits, fbits) {
                var bits = [],
                    i, j, b, str, bias, s, e, f;
                for (i = bytes.length; i; i -= 1) {
                    b = bytes[i - 1];
                    for (j = 8; j; j -= 1) {
                        bits.push(b % 2 ? 1 : 0);
                        b = b >> 1
                    }
                }
                bits.reverse();
                str = bits.join("");
                bias = (1 << ebits - 1) - 1;
                s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
                e = parseInt(str.substring(1, 1 + ebits), 2);
                f = parseInt(str.substring(1 + ebits), 2);
                if (e === (1 << ebits) - 1) {
                    return f !== 0 ? NaN : s * Infinity
                } else if (e > 0) {
                    return s * pow(2, e - bias) * (1 + f / pow(2, fbits))
                } else if (f !== 0) {
                    return s * pow(2, -(bias - 1)) * (f / pow(2, fbits))
                } else {
                    return s < 0 ? -0 : 0
                }
            }

            function unpackF64(b) {
                return unpackIEEE754(b, 11, 52)
            }

            function packF64(v) {
                return packIEEE754(v, 11, 52)
            }

            function unpackF32(b) {
                return unpackIEEE754(b, 8, 23)
            }

            function packF32(v) {
                return packIEEE754(v, 8, 23)
            }(function() {
                var ArrayBuffer = function ArrayBuffer(length) {
                    length = ECMAScript.ToInt32(length);
                    if (length < 0) throw new RangeError("ArrayBuffer size is not a small enough positive integer");
                    this.byteLength = length;
                    this._bytes = [];
                    this._bytes.length = length;
                    var i;
                    for (i = 0; i < this.byteLength; i += 1) {
                        this._bytes[i] = 0
                    }
                    configureProperties(this)
                };
                exports.ArrayBuffer = exports.ArrayBuffer || ArrayBuffer;
                var ArrayBufferView = function ArrayBufferView() {};

                function makeConstructor(bytesPerElement, pack, unpack) {
                    var ctor;
                    ctor = function(buffer, byteOffset, length) {
                        var array, sequence, i, s;
                        if (!arguments.length || typeof arguments[0] === "number") {
                            this.length = ECMAScript.ToInt32(arguments[0]);
                            if (length < 0) throw new RangeError("ArrayBufferView size is not a small enough positive integer");
                            this.byteLength = this.length * this.BYTES_PER_ELEMENT;
                            this.buffer = new ArrayBuffer(this.byteLength);
                            this.byteOffset = 0
                        } else if (typeof arguments[0] === "object" && arguments[0].constructor === ctor) {
                            array = arguments[0];
                            this.length = array.length;
                            this.byteLength = this.length * this.BYTES_PER_ELEMENT;
                            this.buffer = new ArrayBuffer(this.byteLength);
                            this.byteOffset = 0;
                            for (i = 0; i < this.length; i += 1) {
                                this._setter(i, array._getter(i))
                            }
                        } else if (typeof arguments[0] === "object" && !(arguments[0] instanceof ArrayBuffer || ECMAScript.Class(arguments[0]) === "ArrayBuffer")) {
                            sequence = arguments[0];
                            this.length = ECMAScript.ToUint32(sequence.length);
                            this.byteLength = this.length * this.BYTES_PER_ELEMENT;
                            this.buffer = new ArrayBuffer(this.byteLength);
                            this.byteOffset = 0;
                            for (i = 0; i < this.length; i += 1) {
                                s = sequence[i];
                                this._setter(i, Number(s))
                            }
                        } else if (typeof arguments[0] === "object" && (arguments[0] instanceof ArrayBuffer || ECMAScript.Class(arguments[0]) === "ArrayBuffer")) {
                            this.buffer = buffer;
                            this.byteOffset = ECMAScript.ToUint32(byteOffset);
                            if (this.byteOffset > this.buffer.byteLength) {
                                throw new RangeError("byteOffset out of range")
                            }
                            if (this.byteOffset % this.BYTES_PER_ELEMENT) {
                                throw new RangeError("ArrayBuffer length minus the byteOffset is not a multiple of the element size.")
                            }
                            if (arguments.length < 3) {
                                this.byteLength = this.buffer.byteLength - this.byteOffset;
                                if (this.byteLength % this.BYTES_PER_ELEMENT) {
                                    throw new RangeError("length of buffer minus byteOffset not a multiple of the element size")
                                }
                                this.length = this.byteLength / this.BYTES_PER_ELEMENT
                            } else {
                                this.length = ECMAScript.ToUint32(length);
                                this.byteLength = this.length * this.BYTES_PER_ELEMENT
                            }
                            if (this.byteOffset + this.byteLength > this.buffer.byteLength) {
                                throw new RangeError("byteOffset and length reference an area beyond the end of the buffer")
                            }
                        } else {
                            throw new TypeError("Unexpected argument type(s)")
                        }
                        this.constructor = ctor;
                        configureProperties(this);
                        makeArrayAccessors(this)
                    };
                    ctor.prototype = new ArrayBufferView;
                    ctor.prototype.BYTES_PER_ELEMENT = bytesPerElement;
                    ctor.prototype._pack = pack;
                    ctor.prototype._unpack = unpack;
                    ctor.BYTES_PER_ELEMENT = bytesPerElement;
                    ctor.prototype._getter = function(index) {
                        if (arguments.length < 1) throw new SyntaxError("Not enough arguments");
                        index = ECMAScript.ToUint32(index);
                        if (index >= this.length) {
                            return undefined
                        }
                        var bytes = [],
                            i, o;
                        for (i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT; i < this.BYTES_PER_ELEMENT; i += 1, o += 1) {
                            bytes.push(this.buffer._bytes[o])
                        }
                        return this._unpack(bytes)
                    };
                    ctor.prototype.get = ctor.prototype._getter;
                    ctor.prototype._setter = function(index, value) {
                        if (arguments.length < 2) throw new SyntaxError("Not enough arguments");
                        index = ECMAScript.ToUint32(index);

                        if (index >= this.length) {
                            return undefined
                        }
                        var bytes = this._pack(value),
                            i, o;
                        for (i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT; i < this.BYTES_PER_ELEMENT; i += 1, o += 1) {
                            this.buffer._bytes[o] = bytes[i]
                        }
                    };
                    ctor.prototype.set = function(index, value) {
                        if (arguments.length < 1) throw new SyntaxError("Not enough arguments");
                        var array, sequence, offset, len, i, s, d, byteOffset, byteLength, tmp;
                        if (typeof arguments[0] === "object" && arguments[0].constructor === this.constructor) {
                            array = arguments[0];
                            offset = ECMAScript.ToUint32(arguments[1]);
                            if (offset + array.length > this.length) {
                                throw new RangeError("Offset plus length of array is out of range")
                            }
                            byteOffset = this.byteOffset + offset * this.BYTES_PER_ELEMENT;
                            byteLength = array.length * this.BYTES_PER_ELEMENT;
                            if (array.buffer === this.buffer) {
                                tmp = [];
                                for (i = 0, s = array.byteOffset; i < byteLength; i += 1, s += 1) {
                                    tmp[i] = array.buffer._bytes[s]
                                }
                                for (i = 0, d = byteOffset; i < byteLength; i += 1, d += 1) {
                                    this.buffer._bytes[d] = tmp[i]
                                }
                            } else {
                                for (i = 0, s = array.byteOffset, d = byteOffset; i < byteLength; i += 1, s += 1, d += 1) {
                                    this.buffer._bytes[d] = array.buffer._bytes[s]
                                }
                            }
                        } else if (typeof arguments[0] === "object" && typeof arguments[0].length !== "undefined") {
                            sequence = arguments[0];
                            len = ECMAScript.ToUint32(sequence.length);
                            offset = ECMAScript.ToUint32(arguments[1]);
                            if (offset + len > this.length) {
                                throw new RangeError("Offset plus length of array is out of range")
                            }
                            for (i = 0; i < len; i += 1) {
                                s = sequence[i];
                                this._setter(offset + i, Number(s))
                            }
                        } else {
                            throw new TypeError("Unexpected argument type(s)")
                        }
                    };
                    ctor.prototype.subarray = function(start, end) {
                        function clamp(v, min, max) {
                            return v < min ? min : v > max ? max : v
                        }
                        start = ECMAScript.ToInt32(start);
                        end = ECMAScript.ToInt32(end);
                        if (arguments.length < 1) {
                            start = 0
                        }
                        if (arguments.length < 2) {
                            end = this.length
                        }
                        if (start < 0) {
                            start = this.length + start
                        }
                        if (end < 0) {
                            end = this.length + end
                        }
                        start = clamp(start, 0, this.length);
                        end = clamp(end, 0, this.length);
                        var len = end - start;
                        if (len < 0) {
                            len = 0
                        }
                        return new this.constructor(this.buffer, this.byteOffset + start * this.BYTES_PER_ELEMENT, len)
                    };
                    return ctor
                }
                var Int8Array = makeConstructor(1, packI8, unpackI8);
                var Uint8Array = makeConstructor(1, packU8, unpackU8);
                var Uint8ClampedArray = makeConstructor(1, packU8Clamped, unpackU8);
                var Int16Array = makeConstructor(2, packI16, unpackI16);
                var Uint16Array = makeConstructor(2, packU16, unpackU16);
                var Int32Array = makeConstructor(4, packI32, unpackI32);
                var Uint32Array = makeConstructor(4, packU32, unpackU32);
                var Float32Array = makeConstructor(4, packF32, unpackF32);
                var Float64Array = makeConstructor(8, packF64, unpackF64);
                exports.Int8Array = exports.Int8Array || Int8Array;
                exports.Uint8Array = exports.Uint8Array || Uint8Array;
                exports.Uint8ClampedArray = exports.Uint8ClampedArray || Uint8ClampedArray;
                exports.Int16Array = exports.Int16Array || Int16Array;
                exports.Uint16Array = exports.Uint16Array || Uint16Array;
                exports.Int32Array = exports.Int32Array || Int32Array;
                exports.Uint32Array = exports.Uint32Array || Uint32Array;
                exports.Float32Array = exports.Float32Array || Float32Array;
                exports.Float64Array = exports.Float64Array || Float64Array
            })();
            (function() {
                function r(array, index) {
                    return ECMAScript.IsCallable(array.get) ? array.get(index) : array[index]
                }
                var IS_BIG_ENDIAN = function() {
                    var u16array = new exports.Uint16Array([4660]),
                        u8array = new exports.Uint8Array(u16array.buffer);
                    return r(u8array, 0) === 18
                }();
                var DataView = function DataView(buffer, byteOffset, byteLength) {
                    if (arguments.length === 0) {
                        buffer = new exports.ArrayBuffer(0)
                    } else if (!(buffer instanceof exports.ArrayBuffer || ECMAScript.Class(buffer) === "ArrayBuffer")) {
                        throw new TypeError("TypeError")
                    }
                    this.buffer = buffer || new exports.ArrayBuffer(0);
                    this.byteOffset = ECMAScript.ToUint32(byteOffset);
                    if (this.byteOffset > this.buffer.byteLength) {
                        throw new RangeError("byteOffset out of range")
                    }
                    if (arguments.length < 3) {
                        this.byteLength = this.buffer.byteLength - this.byteOffset
                    } else {
                        this.byteLength = ECMAScript.ToUint32(byteLength)
                    }
                    if (this.byteOffset + this.byteLength > this.buffer.byteLength) {
                        throw new RangeError("byteOffset and length reference an area beyond the end of the buffer")
                    }
                    configureProperties(this)
                };

                function makeGetter(arrayType) {
                    return function(byteOffset, littleEndian) {
                        byteOffset = ECMAScript.ToUint32(byteOffset);
                        if (byteOffset + arrayType.BYTES_PER_ELEMENT > this.byteLength) {
                            throw new RangeError("Array index out of range")
                        }
                        byteOffset += this.byteOffset;
                        var uint8Array = new exports.Uint8Array(this.buffer, byteOffset, arrayType.BYTES_PER_ELEMENT),
                            bytes = [],
                            i;
                        for (i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1) {
                            bytes.push(r(uint8Array, i))
                        }
                        if (Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN)) {
                            bytes.reverse()
                        }
                        return r(new arrayType(new exports.Uint8Array(bytes).buffer), 0)
                    }
                }
                DataView.prototype.getUint8 = makeGetter(exports.Uint8Array);
                DataView.prototype.getInt8 = makeGetter(exports.Int8Array);
                DataView.prototype.getUint16 = makeGetter(exports.Uint16Array);
                DataView.prototype.getInt16 = makeGetter(exports.Int16Array);
                DataView.prototype.getUint32 = makeGetter(exports.Uint32Array);
                DataView.prototype.getInt32 = makeGetter(exports.Int32Array);
                DataView.prototype.getFloat32 = makeGetter(exports.Float32Array);
                DataView.prototype.getFloat64 = makeGetter(exports.Float64Array);

                function makeSetter(arrayType) {
                    return function(byteOffset, value, littleEndian) {
                        byteOffset = ECMAScript.ToUint32(byteOffset);
                        if (byteOffset + arrayType.BYTES_PER_ELEMENT > this.byteLength) {
                            throw new RangeError("Array index out of range")
                        }
                        var typeArray = new arrayType([value]),
                            byteArray = new exports.Uint8Array(typeArray.buffer),
                            bytes = [],
                            i, byteView;
                        for (i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1) {
                            bytes.push(r(byteArray, i))
                        }
                        if (Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN)) {
                            bytes.reverse()
                        }
                        byteView = new exports.Uint8Array(this.buffer, byteOffset, arrayType.BYTES_PER_ELEMENT);
                        byteView.set(bytes)
                    }
                }
                DataView.prototype.setUint8 = makeSetter(exports.Uint8Array);
                DataView.prototype.setInt8 = makeSetter(exports.Int8Array);
                DataView.prototype.setUint16 = makeSetter(exports.Uint16Array);
                DataView.prototype.setInt16 = makeSetter(exports.Int16Array);
                DataView.prototype.setUint32 = makeSetter(exports.Uint32Array);
                DataView.prototype.setInt32 = makeSetter(exports.Int32Array);
                DataView.prototype.setFloat32 = makeSetter(exports.Float32Array);
                DataView.prototype.setFloat64 = makeSetter(exports.Float64Array);
                exports.DataView = exports.DataView || DataView
            })()
        }, {}],
        78: [function(require, module, exports) {
            arguments[4][28][0].apply(exports, arguments)
        }, {
            "./lib/CodeGenerator": 79,
            dup: 28
        }],
        79: [function(require, module, exports) {
            arguments[4][29][0].apply(exports, arguments)
        }, {
            "./Interpreter": 80,
            dup: 29,
            extend: 58,
            "mr-parser": 91
        }],
        80: [function(require, module, exports) {
            arguments[4][30][0].apply(exports, arguments)
        }, {
            "./node/ArrayNode": 83,
            "./node/AssignmentNode": 84,
            "./node/ConditionalNode": 85,
            "./node/ConstantNode": 86,
            "./node/FunctionNode": 87,
            "./node/OperatorNode": 88,
            "./node/SymbolNode": 89,
            "./node/UnaryNode": 90,
            dup: 30,
            extend: 58
        }],
        81: [function(require, module, exports) {
            arguments[4][31][0].apply(exports, arguments)
        }, {
            dup: 31
        }],
        82: [function(require, module, exports) {
            arguments[4][32][0].apply(exports, arguments)
        }, {
            dup: 32
        }],
        83: [function(require, module, exports) {
            arguments[4][33][0].apply(exports, arguments)
        }, {
            dup: 33
        }],
        84: [function(require, module, exports) {
            arguments[4][34][0].apply(exports, arguments)
        }, {
            dup: 34
        }],
        85: [function(require, module, exports) {
            arguments[4][35][0].apply(exports, arguments)
        }, {
            dup: 35
        }],
        86: [function(require, module, exports) {
            arguments[4][36][0].apply(exports, arguments)
        }, {
            dup: 36
        }],
        87: [function(require, module, exports) {
            arguments[4][37][0].apply(exports, arguments)
        }, {
            dup: 37,
            "mr-parser": 91
        }],
        88: [function(require, module, exports) {
            arguments[4][38][0].apply(exports, arguments)
        }, {
            "../misc/Operators": 81,
            dup: 38
        }],
        89: [function(require, module, exports) {
            arguments[4][39][0].apply(exports, arguments)
        }, {
            dup: 39
        }],
        90: [function(require, module, exports) {
            arguments[4][40][0].apply(exports, arguments)
        }, {
            "../misc/UnaryOperators": 82,
            dup: 40
        }],
        91: [function(require, module, exports) {
            arguments[4][42][0].apply(exports, arguments)
        }, {
            "./lib/Lexer": 92,
            "./lib/Parser": 93,
            "./lib/node/": 104,
            dup: 42
        }],
        92: [function(require, module, exports) {
            arguments[4][43][0].apply(exports, arguments)
        }, {
            "./token-type": 105,
            dup: 43
        }],
        93: [function(require, module, exports) {
            arguments[4][44][0].apply(exports, arguments)
        }, {
            "./Lexer": 92,
            "./node/ArrayNode": 94,
            "./node/AssignmentNode": 95,
            "./node/BlockNode": 96,
            "./node/ConditionalNode": 97,
            "./node/ConstantNode": 98,
            "./node/FunctionNode": 99,
            "./node/OperatorNode": 101,
            "./node/SymbolNode": 102,
            "./node/UnaryNode": 103,
            "./token-type": 105,
            dup: 44
        }],
        94: [function(require, module, exports) {
            arguments[4][45][0].apply(exports, arguments)
        }, {
            "./Node": 100,
            dup: 45
        }],
        95: [function(require, module, exports) {
            arguments[4][46][0].apply(exports, arguments)
        }, {
            "./Node": 100,
            dup: 46
        }],
        96: [function(require, module, exports) {
            arguments[4][47][0].apply(exports, arguments)
        }, {
            "./Node": 100,
            dup: 47
        }],
        97: [function(require, module, exports) {
            arguments[4][48][0].apply(exports, arguments)
        }, {
            "./Node": 100,
            dup: 48
        }],
        98: [function(require, module, exports) {
            arguments[4][49][0].apply(exports, arguments)
        }, {
            "./Node": 100,
            dup: 49
        }],
        99: [function(require, module, exports) {
            arguments[4][50][0].apply(exports, arguments)
        }, {
            "./Node": 100,
            dup: 50
        }],
        100: [function(require, module, exports) {
            arguments[4][51][0].apply(exports, arguments)
        }, {
            dup: 51
        }],
        101: [function(require, module, exports) {
            arguments[4][52][0].apply(exports, arguments)
        }, {
            "./Node": 100,
            dup: 52
        }],
        102: [function(require, module, exports) {
            arguments[4][53][0].apply(exports, arguments)
        }, {
            "./Node": 100,
            dup: 53
        }],
        103: [function(require, module, exports) {
            arguments[4][54][0].apply(exports, arguments)
        }, {
            "./Node": 100,
            dup: 54
        }],
        104: [function(require, module, exports) {
            arguments[4][55][0].apply(exports, arguments)
        }, {
            "./ArrayNode": 94,
            "./AssignmentNode": 95,
            "./BlockNode": 96,
            "./ConditionalNode": 97,
            "./ConstantNode": 98,
            "./FunctionNode": 99,
            "./Node": 100,
            "./OperatorNode": 101,
            "./SymbolNode": 102,
            "./UnaryNode": 103,
            dup: 55
        }],
        105: [function(require, module, exports) {
            arguments[4][56][0].apply(exports, arguments)
        }, {
            dup: 56
        }],
        106: [function(require, module, exports) {
            "use strict";
            module.exports = function isObject(x) {
                return typeof x === "object" && x !== null
            }
        }, {}],
        107: [function(require, module, exports) {
            (function(process) {
                var keys = require("vkey");
                var list = Object.keys(keys);
                var down = {};
                reset();
                module.exports = pressed;
                if (process.browser) {
                    window.addEventListener("keydown", keydown, false);
                    window.addEventListener("keyup", keyup, false);
                    window.addEventListener("blur", reset, false)
                }

                function pressed(key) {
                    return key ? down[key] : down
                }

                function reset() {
                    list.forEach(function(code) {
                        down[keys[code]] = false
                    })
                }

                function keyup(e) {
                    down[keys[e.keyCode]] = false
                }

                function keydown(e) {
                    down[keys[e.keyCode]] = true
                }
            }).call(this, require("_process"))
        }, {
            _process: 2,
            vkey: 108
        }],
        108: [function(require, module, exports) {
            var ua = typeof window !== "undefined" ? window.navigator.userAgent : "",
                isOSX = /OS X/.test(ua),
                isOpera = /Opera/.test(ua),
                maybeFirefox = !/like Gecko/.test(ua) && !isOpera;
            var i, output = module.exports = {
                0: isOSX ? "<menu>" : "<UNK>",
                1: "<mouse 1>",
                2: "<mouse 2>",
                3: "<break>",
                4: "<mouse 3>",
                5: "<mouse 4>",
                6: "<mouse 5>",
                8: "<backspace>",
                9: "<tab>",
                12: "<clear>",
                13: "<enter>",
                16: "<shift>",
                17: "<control>",
                18: "<alt>",
                19: "<pause>",
                20: "<caps-lock>",
                21: "<ime-hangul>",
                23: "<ime-junja>",
                24: "<ime-final>",
                25: "<ime-kanji>",
                27: "<escape>",
                28: "<ime-convert>",
                29: "<ime-nonconvert>",
                30: "<ime-accept>",
                31: "<ime-mode-change>",
                27: "<escape>",
                32: "<space>",
                33: "<page-up>",
                34: "<page-down>",
                35: "<end>",
                36: "<home>",
                37: "<left>",
                38: "<up>",
                39: "<right>",
                40: "<down>",
                41: "<select>",
                42: "<print>",
                43: "<execute>",
                44: "<snapshot>",
                45: "<insert>",
                46: "<delete>",
                47: "<help>",
                91: "<meta>",
                92: "<meta>",
                93: isOSX ? "<meta>" : "<menu>",
                95: "<sleep>",
                106: "<num-*>",
                107: "<num-+>",
                108: "<num-enter>",
                109: "<num-->",
                110: "<num-.>",
                111: "<num-/>",
                144: "<num-lock>",
                145: "<scroll-lock>",
                160: "<shift-left>",
                161: "<shift-right>",
                162: "<control-left>",
                163: "<control-right>",
                164: "<alt-left>",
                165: "<alt-right>",
                166: "<browser-back>",
                167: "<browser-forward>",
                168: "<browser-refresh>",
                169: "<browser-stop>",
                170: "<browser-search>",
                171: "<browser-favorites>",
                172: "<browser-home>",
                173: isOSX && maybeFirefox ? "-" : "<volume-mute>",
                174: "<volume-down>",
                175: "<volume-up>",
                176: "<next-track>",
                177: "<prev-track>",
                178: "<stop>",
                179: "<play-pause>",
                180: "<launch-mail>",
                181: "<launch-media-select>",
                182: "<launch-app 1>",
                183: "<launch-app 2>",
                186: ";",
                187: "=",
                188: ",",
                189: "-",
                190: ".",
                191: "/",
                192: "`",
                219: "[",
                220: "\\",
                221: "]",
                222: "'",
                223: "<meta>",
                224: "<meta>",
                226: "<alt-gr>",
                229: "<ime-process>",
                231: isOpera ? "`" : "<unicode>",
                246: "<attention>",
                247: "<crsel>",
                248: "<exsel>",
                249: "<erase-eof>",
                250: "<play>",
                251: "<zoom>",
                252: "<no-name>",
                253: "<pa-1>",
                254: "<clear>"
            };
            for (i = 58; i < 65; ++i) {
                output[i] = String.fromCharCode(i)
            }
            for (i = 48; i < 58; ++i) {
                output[i] = i - 48 + ""
            }
            for (i = 65; i < 91; ++i) {
                output[i] = String.fromCharCode(i)
            }
            for (i = 96; i < 106; ++i) {
                output[i] = "<num-" + (i - 96) + ">"
            }
            for (i = 112; i < 136; ++i) {
                output[i] = "F" + (i - 111)
            }
        }, {}],
        109: [function(require, module, exports) {
            var Emitter = require("events").EventEmitter;
            var vkey = require("vkey");
            module.exports = function(keys, el) {
                if (typeof keys === "string") keys = [keys];
                if (!el) el = window;
                var emitter = new Emitter;
                emitter.pressed = {};
                el.addEventListener("blur", clearPressed);
                el.addEventListener("focus", clearPressed);
                el.addEventListener("keydown", function(ev) {
                    var key = vkey[ev.keyCode];
                    emitter.pressed[key] = true;
                    var allPressed = true;
                    keys.forEach(function(k) {
                        if (!emitter.pressed[k]) allPressed = false
                    });
                    if (allPressed) {
                        emitter.emit("pressed", emitter.pressed);
                        clearPressed()
                    }
                });
                el.addEventListener("keyup", function(ev) {
                    delete emitter.pressed[vkey[ev.keyCode]]
                });

                function clearPressed() {
                    emitter.pressed = {}
                }
                return emitter
            }
        }, {
            events: 1,
            vkey: 110
        }],
        110: [function(require, module, exports) {
            arguments[4][108][0].apply(exports, arguments)
        }, {
            dup: 108
        }]
    }, {}, [3])(3)
});
