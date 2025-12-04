"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadParallaxMover = loadParallaxMover;
const ParallaxMover_js_1 = require("./ParallaxMover.js");
async function loadParallaxMover(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addMover("parallax", () => {
        return Promise.resolve(new ParallaxMover_js_1.ParallaxMover());
    }, refresh);
}
