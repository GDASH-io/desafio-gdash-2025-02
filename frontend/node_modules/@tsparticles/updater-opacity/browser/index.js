import { OpacityUpdater } from "./OpacityUpdater.js";
export async function loadOpacityUpdater(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addParticleUpdater("opacity", container => {
        return Promise.resolve(new OpacityUpdater(container));
    }, refresh);
}
