import { EmittersPlugin } from "./EmittersPlugin.js";
import { ShapeManager } from "./ShapeManager.js";
export async function loadEmittersPlugin(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    if (!engine.emitterShapeManager) {
        engine.emitterShapeManager = new ShapeManager(engine);
    }
    if (!engine.addEmitterShapeGenerator) {
        engine.addEmitterShapeGenerator = (name, generator) => {
            engine.emitterShapeManager?.addShapeGenerator(name, generator);
        };
    }
    const plugin = new EmittersPlugin(engine);
    await engine.addPlugin(plugin, refresh);
}
export * from "./EmitterContainer.js";
export * from "./EmitterShapeBase.js";
export * from "./EmittersEngine.js";
export * from "./IEmitterShape.js";
export * from "./IEmitterShapeGenerator.js";
export * from "./Enums/EmitterClickMode.js";
export * from "./IRandomPositionData.js";
