"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadColorUpdater = loadColorUpdater;
const ColorUpdater_js_1 = require("./ColorUpdater.js");
async function loadColorUpdater(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addParticleUpdater("color", container => {
        return Promise.resolve(new ColorUpdater_js_1.ColorUpdater(container, engine));
    }, refresh);
}
