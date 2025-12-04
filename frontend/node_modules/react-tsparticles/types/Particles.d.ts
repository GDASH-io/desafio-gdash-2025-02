import { Component, ReactNode } from "react";
import type { IParticlesProps } from "./IParticlesProps";
import type { IParticlesState } from "./IParticlesState";
export default class Particles extends Component<IParticlesProps, IParticlesState> {
    static defaultProps: IParticlesProps;
    constructor(props: IParticlesProps);
    destroy(): void;
    shouldComponentUpdate(nextProps: Readonly<IParticlesProps>): boolean;
    componentDidUpdate(): void;
    forceUpdate(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): ReactNode;
    private refresh;
    private loadParticles;
}
