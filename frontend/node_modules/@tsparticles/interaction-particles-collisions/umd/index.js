(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Collider.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadParticlesCollisionsInteraction = loadParticlesCollisionsInteraction;
    const Collider_js_1 = require("./Collider.js");
    async function loadParticlesCollisionsInteraction(engine, refresh = true) {
        engine.checkVersion("3.9.1");
        await engine.addInteractor("particlesCollisions", container => {
            return Promise.resolve(new Collider_js_1.Collider(container));
        }, refresh);
    }
});
