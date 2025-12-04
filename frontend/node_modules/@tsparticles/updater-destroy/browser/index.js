import { DestroyUpdater } from "./DestroyUpdater.js";
export async function loadDestroyUpdater(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addParticleUpdater("destroy", container => {
        return Promise.resolve(new DestroyUpdater(engine, container));
    }, refresh);
}
