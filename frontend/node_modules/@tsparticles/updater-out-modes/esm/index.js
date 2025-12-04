import { OutOfCanvasUpdater } from "./OutOfCanvasUpdater.js";
export async function loadOutModesUpdater(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addParticleUpdater("outModes", container => {
        return Promise.resolve(new OutOfCanvasUpdater(container));
    }, refresh);
}
