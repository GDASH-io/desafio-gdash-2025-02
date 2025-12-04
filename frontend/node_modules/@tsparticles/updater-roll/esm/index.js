import { RollUpdater } from "./RollUpdater.js";
export async function loadRollUpdater(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addParticleUpdater("roll", () => {
        return Promise.resolve(new RollUpdater(engine));
    }, refresh);
}
