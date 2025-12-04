import { BaseMover } from "./BaseMover.js";
export async function loadBaseMover(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addMover("base", () => {
        return Promise.resolve(new BaseMover());
    }, refresh);
}
