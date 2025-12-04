import { ParallaxMover } from "./ParallaxMover.js";
export async function loadParallaxMover(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addMover("parallax", () => {
        return Promise.resolve(new ParallaxMover());
    }, refresh);
}
