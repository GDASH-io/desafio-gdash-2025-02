import { AbsorbersPlugin } from "./AbsorbersPlugin.js";
export async function loadAbsorbersPlugin(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addPlugin(new AbsorbersPlugin(engine), refresh);
}
export * from "./AbsorberContainer.js";
export * from "./Enums/AbsorberClickMode.js";
