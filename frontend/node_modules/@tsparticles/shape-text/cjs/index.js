"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTextShape = loadTextShape;
const TextDrawer_js_1 = require("./TextDrawer.js");
async function loadTextShape(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addShape(new TextDrawer_js_1.TextDrawer(), refresh);
}
