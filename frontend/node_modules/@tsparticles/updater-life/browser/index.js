import { LifeUpdater } from "./LifeUpdater.js";
export async function loadLifeUpdater(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addParticleUpdater("life", async (container) => {
        return Promise.resolve(new LifeUpdater(container));
    }, refresh);
}
