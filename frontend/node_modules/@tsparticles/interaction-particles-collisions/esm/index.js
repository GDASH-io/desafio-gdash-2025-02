import { Collider } from "./Collider.js";
export async function loadParticlesCollisionsInteraction(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addInteractor("particlesCollisions", container => {
        return Promise.resolve(new Collider(container));
    }, refresh);
}
