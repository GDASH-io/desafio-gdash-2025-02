import { Pusher } from "./Pusher.js";
export async function loadExternalPushInteraction(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addInteractor("externalPush", container => {
        return Promise.resolve(new Pusher(container));
    }, refresh);
}
export * from "./Options/Classes/Push.js";
export * from "./Options/Interfaces/IPush.js";
