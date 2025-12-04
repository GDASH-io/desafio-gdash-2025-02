"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTwinkleUpdater = loadTwinkleUpdater;
const TwinkleUpdater_js_1 = require("./TwinkleUpdater.js");
async function loadTwinkleUpdater(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addParticleUpdater("twinkle", () => {
        return Promise.resolve(new TwinkleUpdater_js_1.TwinkleUpdater(engine));
    }, refresh);
}
