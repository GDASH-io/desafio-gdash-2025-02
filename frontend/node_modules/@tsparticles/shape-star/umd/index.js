(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./StarDrawer.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadStarShape = loadStarShape;
    const StarDrawer_js_1 = require("./StarDrawer.js");
    async function loadStarShape(engine, refresh = true) {
        engine.checkVersion("3.9.1");
        await engine.addShape(new StarDrawer_js_1.StarDrawer(), refresh);
    }
});
