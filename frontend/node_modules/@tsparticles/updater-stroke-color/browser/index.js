import { StrokeColorUpdater } from "./StrokeColorUpdater.js";
export async function loadStrokeColorUpdater(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addParticleUpdater("strokeColor", container => {
        return Promise.resolve(new StrokeColorUpdater(container, engine));
    }, refresh);
}
