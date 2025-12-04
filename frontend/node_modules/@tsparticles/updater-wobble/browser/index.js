import { WobbleUpdater } from "./WobbleUpdater.js";
export async function loadWobbleUpdater(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addParticleUpdater("wobble", container => {
        return Promise.resolve(new WobbleUpdater(container));
    }, refresh);
}
