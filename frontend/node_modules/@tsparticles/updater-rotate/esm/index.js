import { RotateUpdater } from "./RotateUpdater.js";
export async function loadRotateUpdater(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addParticleUpdater("rotate", container => {
        return Promise.resolve(new RotateUpdater(container));
    }, refresh);
}
