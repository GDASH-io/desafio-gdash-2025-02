"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualParticle = void 0;
const PixelMode_js_1 = require("../../Enums/Modes/PixelMode.js");
const Utils_js_1 = require("../../Utils/Utils.js");
const TypeUtils_js_1 = require("../../Utils/TypeUtils.js");
const Constants_js_1 = require("../../Core/Utils/Constants.js");
class ManualParticle {
    load(data) {
        if ((0, TypeUtils_js_1.isNull)(data)) {
            return;
        }
        if (data.position) {
            this.position = {
                x: data.position.x ?? Constants_js_1.manualDefaultPosition,
                y: data.position.y ?? Constants_js_1.manualDefaultPosition,
                mode: data.position.mode ?? PixelMode_js_1.PixelMode.percent,
            };
        }
        if (data.options) {
            this.options = (0, Utils_js_1.deepExtend)({}, data.options);
        }
    }
}
exports.ManualParticle = ManualParticle;
