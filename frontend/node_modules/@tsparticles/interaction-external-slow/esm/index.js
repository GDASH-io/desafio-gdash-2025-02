import { Slower } from "./Slower.js";
export async function loadExternalSlowInteraction(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addInteractor("externalSlow", container => {
        return Promise.resolve(new Slower(container));
    }, refresh);
}
export * from "./Options/Classes/Slow.js";
export * from "./Options/Interfaces/ISlow.js";
