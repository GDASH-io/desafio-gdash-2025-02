import React, { Component } from "react";
import { tsParticles } from "tsparticles-engine";
import { deepCompare } from "./Utils";
const defaultId = "tsparticles";
class Particles extends Component {
    constructor(props) {
        super(props);
        this.state = {
            init: false,
            library: undefined,
        };
    }
    destroy() {
        if (!this.state.library) {
            return;
        }
        this.state.library.destroy();
        this.setState({
            library: undefined,
        });
    }
    shouldComponentUpdate(nextProps) {
        const nextOptions = nextProps.options ?? nextProps.params, currentOptions = this.props.options ?? this.props.params;
        return (nextProps.url !== this.props.url ||
            nextProps.id !== this.props.id ||
            nextProps.canvasClassName !== this.props.canvasClassName ||
            nextProps.className !== this.props.className ||
            nextProps.height !== this.props.height ||
            nextProps.width !== this.props.width ||
            !deepCompare(nextProps.style, this.props.style) ||
            nextProps.init !== this.props.init ||
            nextProps.loaded !== this.props.loaded ||
            !deepCompare(nextOptions, currentOptions, key => key.startsWith("_")));
    }
    componentDidUpdate() {
        this.refresh();
    }
    forceUpdate() {
        this.refresh().then(() => {
            super.forceUpdate();
        });
    }
    componentDidMount() {
        (async () => {
            if (this.props.init) {
                await this.props.init(tsParticles);
            }
            this.setState({
                init: true,
            }, async () => {
                await this.loadParticles();
            });
        })();
    }
    componentWillUnmount() {
        this.destroy();
    }
    render() {
        const { width, height, className, canvasClassName, id } = this.props;
        return (React.createElement("div", { className: className, id: id },
            React.createElement("canvas", { className: canvasClassName, style: {
                    ...this.props.style,
                    width,
                    height,
                } })));
    }
    async refresh() {
        this.destroy();
        await this.loadParticles();
    }
    async loadParticles() {
        if (!this.state.init) {
            return;
        }
        const id = this.props.id ?? Particles.defaultProps.id ?? defaultId, container = await tsParticles.load({
            url: this.props.url,
            id,
            options: this.props.options ?? this.props.params,
        });
        if (this.props.container) {
            this.props.container.current = container;
        }
        this.setState({
            library: container,
        });
        if (this.props.loaded) {
            await this.props.loaded(container);
        }
    }
}
Particles.defaultProps = {
    width: "100%",
    height: "100%",
    options: {},
    style: {},
    url: undefined,
    id: defaultId,
};
export default Particles;
