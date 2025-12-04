(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./RotateUpdater.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadRotateUpdater = loadRotateUpdater;
    const RotateUpdater_js_1 = require("./RotateUpdater.js");
    async function loadRotateUpdater(engine, refresh = true) {
        engine.checkVersion("3.9.1");
        await engine.addParticleUpdater("rotate", container => {
            return Promise.resolve(new RotateUpdater_js_1.RotateUpdater(container));
        }, refresh);
    }
});
