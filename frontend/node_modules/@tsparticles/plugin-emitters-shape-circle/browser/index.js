import { EmittersCircleShapeGenerator } from "./EmittersCircleShapeGenerator.js";
export async function loadEmittersShapeCircle(engine, refresh = true) {
    const emittersEngine = engine;
    emittersEngine.checkVersion("3.9.1");
    emittersEngine.addEmitterShapeGenerator?.("circle", new EmittersCircleShapeGenerator());
    await emittersEngine.refresh(refresh);
}
