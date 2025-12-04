(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./EmojiDrawer.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadEmojiShape = loadEmojiShape;
    const EmojiDrawer_js_1 = require("./EmojiDrawer.js");
    async function loadEmojiShape(engine, refresh = true) {
        engine.checkVersion("3.9.1");
        await engine.addShape(new EmojiDrawer_js_1.EmojiDrawer(), refresh);
    }
});
