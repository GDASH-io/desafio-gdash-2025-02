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
