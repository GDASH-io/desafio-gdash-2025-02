import { Bouncer } from "./Bouncer.js";
export async function loadExternalBounceInteraction(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addInteractor("externalBounce", container => {
        return Promise.resolve(new Bouncer(container));
    }, refresh);
}
export * from "./Options/Classes/Bounce.js";
export * from "./Options/Interfaces/IBounce.js";
