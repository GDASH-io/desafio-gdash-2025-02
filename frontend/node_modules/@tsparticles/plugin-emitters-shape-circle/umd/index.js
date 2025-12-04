(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./EmittersCircleShapeGenerator.js"], factory);
    }
})(function (require, exports) {
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
});
