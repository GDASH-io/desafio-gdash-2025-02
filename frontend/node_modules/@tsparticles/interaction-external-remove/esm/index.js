import { Remover } from "./Remover.js";
export async function loadExternalRemoveInteraction(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addInteractor("externalRemove", container => {
        return Promise.resolve(new Remover(container));
    }, refresh);
}
export * from "./Options/Classes/Remove.js";
export * from "./Options/Interfaces/IRemove.js";
