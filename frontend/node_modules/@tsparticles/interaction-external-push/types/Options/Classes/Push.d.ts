import { type IOptionLoader, type IParticlesOptions, type RangeValue, type RecursivePartial, type SingleOrMultiple } from "@tsparticles/engine";
import type { IPush } from "../Interfaces/IPush.js";
export declare class Push implements IPush, IOptionLoader<IPush> {
    default: boolean;
    groups: string[];
    particles?: SingleOrMultiple<RecursivePartial<IParticlesOptions>>;
    quantity: RangeValue;
    constructor();
    load(data?: RecursivePartial<IPush>): void;
}
