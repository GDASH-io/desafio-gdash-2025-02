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
