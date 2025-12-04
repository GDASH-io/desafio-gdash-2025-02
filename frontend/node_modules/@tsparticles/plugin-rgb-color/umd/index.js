(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./RgbColorManager.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadRgbColorPlugin = loadRgbColorPlugin;
    const RgbColorManager_js_1 = require("./RgbColorManager.js");
    async function loadRgbColorPlugin(engine, refresh = true) {
        engine.checkVersion("3.9.1");
        await engine.addColorManager(new RgbColorManager_js_1.RgbColorManager(), refresh);
    }
});
