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
