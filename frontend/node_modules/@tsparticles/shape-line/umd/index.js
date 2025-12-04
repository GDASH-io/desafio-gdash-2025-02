(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./LineDrawer.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadLineShape = loadLineShape;
    const LineDrawer_js_1 = require("./LineDrawer.js");
    async function loadLineShape(engine, refresh = true) {
        engine.checkVersion("3.9.1");
        await engine.addShape(new LineDrawer_js_1.LineDrawer(), refresh);
    }
});
