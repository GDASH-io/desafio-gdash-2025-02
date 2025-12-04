import { CircleDrawer } from "./CircleDrawer.js";
export async function loadCircleShape(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addShape(new CircleDrawer(), refresh);
}
