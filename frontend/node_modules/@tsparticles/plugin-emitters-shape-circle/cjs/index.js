"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEmittersShapeCircle = loadEmittersShapeCircle;
const EmittersCircleShapeGenerator_js_1 = require("./EmittersCircleShapeGenerator.js");
async function loadEmittersShapeCircle(engine, refresh = true) {
    const emittersEngine = engine;
    emittersEngine.checkVersion("3.9.1");
    emittersEngine.addEmitterShapeGenerator?.("circle", new EmittersCircleShapeGenerator_js_1.EmittersCircleShapeGenerator());
    await emittersEngine.refresh(refresh);
}
