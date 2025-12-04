import { HslColorManager } from "./HslColorManager.js";
export async function loadHslColorPlugin(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addColorManager(new HslColorManager(), refresh);
}
