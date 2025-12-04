(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./WobbleUpdater.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadWobbleUpdater = loadWobbleUpdater;
    const WobbleUpdater_js_1 = require("./WobbleUpdater.js");
    async function loadWobbleUpdater(engine, refresh = true) {
        engine.checkVersion("3.9.1");
        await engine.addParticleUpdater("wobble", container => {
            return Promise.resolve(new WobbleUpdater_js_1.WobbleUpdater(container));
        }, refresh);
    }
});
