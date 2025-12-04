"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadStrokeColorUpdater = loadStrokeColorUpdater;
const StrokeColorUpdater_js_1 = require("./StrokeColorUpdater.js");
async function loadStrokeColorUpdater(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addParticleUpdater("strokeColor", container => {
        return Promise.resolve(new StrokeColorUpdater_js_1.StrokeColorUpdater(container, engine));
    }, refresh);
}
