"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadHexColorPlugin = loadHexColorPlugin;
const HexColorManager_js_1 = require("./HexColorManager.js");
async function loadHexColorPlugin(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addColorManager(new HexColorManager_js_1.HexColorManager(), refresh);
}
