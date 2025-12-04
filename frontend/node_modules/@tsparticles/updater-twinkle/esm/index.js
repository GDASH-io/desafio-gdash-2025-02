import { TwinkleUpdater } from "./TwinkleUpdater.js";
export async function loadTwinkleUpdater(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addParticleUpdater("twinkle", () => {
        return Promise.resolve(new TwinkleUpdater(engine));
    }, refresh);
}
