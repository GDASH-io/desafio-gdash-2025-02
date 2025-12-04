import { Attractor } from "./Attractor.js";
export async function loadParticlesAttractInteraction(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addInteractor("particlesAttract", container => {
        return Promise.resolve(new Attractor(container));
    }, refresh);
}
