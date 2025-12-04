import { TiltUpdater } from "./TiltUpdater.js";
export async function loadTiltUpdater(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addParticleUpdater("tilt", container => {
        return Promise.resolve(new TiltUpdater(container));
    }, refresh);
}
