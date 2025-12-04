import { ColorUpdater } from "./ColorUpdater.js";
export async function loadColorUpdater(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addParticleUpdater("color", container => {
        return Promise.resolve(new ColorUpdater(container, engine));
    }, refresh);
}
