"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadOpacityUpdater = loadOpacityUpdater;
const OpacityUpdater_js_1 = require("./OpacityUpdater.js");
async function loadOpacityUpdater(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addParticleUpdater("opacity", container => {
        return Promise.resolve(new OpacityUpdater_js_1.OpacityUpdater(container));
    }, refresh);
}
