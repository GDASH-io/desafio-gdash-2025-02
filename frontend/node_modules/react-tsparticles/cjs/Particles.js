"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const tsparticles_engine_1 = require("tsparticles-engine");
const Utils_1 = require("./Utils");
const defaultId = "tsparticles";
class Particles extends react_1.Component {
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
            !(0, Utils_1.deepCompare)(nextProps.style, this.props.style) ||
            nextProps.init !== this.props.init ||
            nextProps.loaded !== this.props.loaded ||
            !(0, Utils_1.deepCompare)(nextOptions, currentOptions, key => key.startsWith("_")));
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
                await this.props.init(tsparticles_engine_1.tsParticles);
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
        return (react_1.default.createElement("div", { className: className, id: id },
            react_1.default.createElement("canvas", { className: canvasClassName, style: {
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
        const id = this.props.id ?? Particles.defaultProps.id ?? defaultId, container = await tsparticles_engine_1.tsParticles.load({
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
exports.default = Particles;
