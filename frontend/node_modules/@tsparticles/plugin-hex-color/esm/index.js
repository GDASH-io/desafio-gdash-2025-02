import { HexColorManager } from "./HexColorManager.js";
export async function loadHexColorPlugin(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addColorManager(new HexColorManager(), refresh);
}
