import { Connector } from "./Connector.js";
export async function loadExternalConnectInteraction(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addInteractor("externalConnect", container => {
        return Promise.resolve(new Connector(container));
    }, refresh);
}
export * from "./Options/Classes/Connect.js";
export * from "./Options/Classes/ConnectLinks.js";
export * from "./Options/Interfaces/IConnect.js";
export * from "./Options/Interfaces/IConnectLinks.js";
