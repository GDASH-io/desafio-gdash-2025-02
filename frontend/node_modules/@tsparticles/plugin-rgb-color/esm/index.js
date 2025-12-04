import { RgbColorManager } from "./RgbColorManager.js";
export async function loadRgbColorPlugin(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addColorManager(new RgbColorManager(), refresh);
}
