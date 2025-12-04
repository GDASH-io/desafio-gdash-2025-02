import { Repulser } from "./Repulser.js";
export async function loadExternalRepulseInteraction(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addInteractor("externalRepulse", container => {
        return Promise.resolve(new Repulser(engine, container));
    }, refresh);
}
export * from "./Options/Classes/RepulseBase.js";
export * from "./Options/Classes/RepulseDiv.js";
export * from "./Options/Classes/Repulse.js";
export * from "./Options/Interfaces/IRepulseBase.js";
export * from "./Options/Interfaces/IRepulseDiv.js";
export * from "./Options/Interfaces/IRepulse.js";
