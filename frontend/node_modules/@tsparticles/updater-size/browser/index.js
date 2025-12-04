import { SizeUpdater } from "./SizeUpdater.js";
export async function loadSizeUpdater(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addParticleUpdater("size", () => {
        return Promise.resolve(new SizeUpdater());
    }, refresh);
}
