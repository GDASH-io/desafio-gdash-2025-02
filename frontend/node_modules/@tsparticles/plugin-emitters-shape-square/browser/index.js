import { EmittersSquareShapeGenerator } from "./EmittersSquareShapeGenerator.js";
export async function loadEmittersShapeSquare(engine, refresh = true) {
    const emittersEngine = engine;
    emittersEngine.checkVersion("3.9.1");
    emittersEngine.addEmitterShapeGenerator?.("square", new EmittersSquareShapeGenerator());
    await emittersEngine.refresh(refresh);
}
