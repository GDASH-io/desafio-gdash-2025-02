"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCircleShape = loadCircleShape;
const CircleDrawer_js_1 = require("./CircleDrawer.js");
async function loadCircleShape(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addShape(new CircleDrawer_js_1.CircleDrawer(), refresh);
}
