import { StarDrawer } from "./StarDrawer.js";
export async function loadStarShape(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addShape(new StarDrawer(), refresh);
}
