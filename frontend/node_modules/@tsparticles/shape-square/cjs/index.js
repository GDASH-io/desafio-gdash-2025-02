"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSquareShape = loadSquareShape;
const SquareDrawer_js_1 = require("./SquareDrawer.js");
async function loadSquareShape(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addShape(new SquareDrawer_js_1.SquareDrawer(), refresh);
}
