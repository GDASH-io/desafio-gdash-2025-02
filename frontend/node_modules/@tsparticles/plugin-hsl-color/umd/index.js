(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./HslColorManager.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadHslColorPlugin = loadHslColorPlugin;
    const HslColorManager_js_1 = require("./HslColorManager.js");
    async function loadHslColorPlugin(engine, refresh = true) {
        engine.checkVersion("3.9.1");
        await engine.addColorManager(new HslColorManager_js_1.HslColorManager(), refresh);
    }
});
