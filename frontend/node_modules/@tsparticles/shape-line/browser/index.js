import { LineDrawer } from "./LineDrawer.js";
export async function loadLineShape(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addShape(new LineDrawer(), refresh);
}
