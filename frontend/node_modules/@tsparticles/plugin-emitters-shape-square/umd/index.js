(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./EmittersSquareShapeGenerator.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadEmittersShapeSquare = loadEmittersShapeSquare;
    const EmittersSquareShapeGenerator_js_1 = require("./EmittersSquareShapeGenerator.js");
    async function loadEmittersShapeSquare(engine, refresh = true) {
        const emittersEngine = engine;
        emittersEngine.checkVersion("3.9.1");
        emittersEngine.addEmitterShapeGenerator?.("square", new EmittersSquareShapeGenerator_js_1.EmittersSquareShapeGenerator());
        await emittersEngine.refresh(refresh);
    }
});
