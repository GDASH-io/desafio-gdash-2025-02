import { Pauser } from "./Pauser.js";
export async function loadExternalPauseInteraction(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addInteractor("externalPause", container => {
        return Promise.resolve(new Pauser(container));
    }, refresh);
}
