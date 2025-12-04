(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./SquareDrawer.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadSquareShape = loadSquareShape;
    const SquareDrawer_js_1 = require("./SquareDrawer.js");
    async function loadSquareShape(engine, refresh = true) {
        engine.checkVersion("3.9.1");
        await engine.addShape(new SquareDrawer_js_1.SquareDrawer(), refresh);
    }
});
