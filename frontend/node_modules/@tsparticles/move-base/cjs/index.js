"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadBaseMover = loadBaseMover;
const BaseMover_js_1 = require("./BaseMover.js");
async function loadBaseMover(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addMover("base", () => {
        return Promise.resolve(new BaseMover_js_1.BaseMover());
    }, refresh);
}
