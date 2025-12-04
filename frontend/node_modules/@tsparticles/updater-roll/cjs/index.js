"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadRollUpdater = loadRollUpdater;
const RollUpdater_js_1 = require("./RollUpdater.js");
async function loadRollUpdater(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addParticleUpdater("roll", () => {
        return Promise.resolve(new RollUpdater_js_1.RollUpdater(engine));
    }, refresh);
}
