import { TrailMaker } from "./TrailMaker.js";
export async function loadExternalTrailInteraction(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addInteractor("externalTrail", container => {
        return Promise.resolve(new TrailMaker(container));
    }, refresh);
}
export * from "./Options/Classes/Trail.js";
export * from "./Options/Interfaces/ITrail.js";
