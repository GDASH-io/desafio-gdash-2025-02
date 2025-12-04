import { SquareDrawer } from "./SquareDrawer.js";
export async function loadSquareShape(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addShape(new SquareDrawer(), refresh);
}
