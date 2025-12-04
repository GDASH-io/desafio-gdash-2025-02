(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./LifeUpdater.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadLifeUpdater = loadLifeUpdater;
    const LifeUpdater_js_1 = require("./LifeUpdater.js");
    async function loadLifeUpdater(engine, refresh = true) {
        engine.checkVersion("3.9.1");
        await engine.addParticleUpdater("life", async (container) => {
            return Promise.resolve(new LifeUpdater_js_1.LifeUpdater(container));
        }, refresh);
    }
});
