"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadLineShape = loadLineShape;
const LineDrawer_js_1 = require("./LineDrawer.js");
async function loadLineShape(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addShape(new LineDrawer_js_1.LineDrawer(), refresh);
}
