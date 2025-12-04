"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadExternalPauseInteraction = loadExternalPauseInteraction;
const Pauser_js_1 = require("./Pauser.js");
async function loadExternalPauseInteraction(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addInteractor("externalPause", container => {
        return Promise.resolve(new Pauser_js_1.Pauser(container));
    }, refresh);
}
