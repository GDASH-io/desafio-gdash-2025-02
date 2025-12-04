import { TextDrawer } from "./TextDrawer.js";
export async function loadTextShape(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addShape(new TextDrawer(), refresh);
}
