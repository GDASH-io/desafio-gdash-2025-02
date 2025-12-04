import { PixelMode } from "../../Enums/Modes/PixelMode.js";
import { deepExtend } from "../../Utils/Utils.js";
import { isNull } from "../../Utils/TypeUtils.js";
import { manualDefaultPosition } from "../../Core/Utils/Constants.js";
export class ManualParticle {
    load(data) {
        if (isNull(data)) {
            return;
        }
        if (data.position) {
            this.position = {
                x: data.position.x ?? manualDefaultPosition,
                y: data.position.y ?? manualDefaultPosition,
                mode: data.position.mode ?? PixelMode.percent,
            };
        }
        if (data.options) {
            this.options = deepExtend({}, data.options);
        }
    }
}
