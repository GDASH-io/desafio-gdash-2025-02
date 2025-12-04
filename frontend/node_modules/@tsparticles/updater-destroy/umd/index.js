(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./DestroyUpdater.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadDestroyUpdater = loadDestroyUpdater;
    const DestroyUpdater_js_1 = require("./DestroyUpdater.js");
    async function loadDestroyUpdater(engine, refresh = true) {
        engine.checkVersion("3.9.1");
        await engine.addParticleUpdater("destroy", container => {
            return Promise.resolve(new DestroyUpdater_js_1.DestroyUpdater(engine, container));
        }, refresh);
    }
});
