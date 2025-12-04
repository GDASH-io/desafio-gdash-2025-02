"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTiltUpdater = loadTiltUpdater;
const TiltUpdater_js_1 = require("./TiltUpdater.js");
async function loadTiltUpdater(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addParticleUpdater("tilt", container => {
        return Promise.resolve(new TiltUpdater_js_1.TiltUpdater(container));
    }, refresh);
}
