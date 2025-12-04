(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../Core/Utils/Constants.js", "../Enums/Types/AlterType.js", "./ColorUtils.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.drawLine = drawLine;
    exports.paintBase = paintBase;
    exports.paintImage = paintImage;
    exports.clear = clear;
    exports.drawParticle = drawParticle;
    exports.drawEffect = drawEffect;
    exports.drawShape = drawShape;
    exports.drawShapeAfterDraw = drawShapeAfterDraw;
    exports.drawPlugin = drawPlugin;
    exports.drawParticlePlugin = drawParticlePlugin;
    exports.alterHsl = alterHsl;
    const Constants_js_1 = require("../Core/Utils/Constants.js");
    const AlterType_js_1 = require("../Enums/Types/AlterType.js");
    const ColorUtils_js_1 = require("./ColorUtils.js");
    function drawLine(context, begin, end) {
        context.beginPath();
        context.moveTo(begin.x, begin.y);
        context.lineTo(end.x, end.y);
        context.closePath();
    }
    function paintBase(context, dimension, baseColor) {
        context.fillStyle = baseColor ?? "rgba(0,0,0,0)";
        context.fillRect(Constants_js_1.originPoint.x, Constants_js_1.originPoint.y, dimension.width, dimension.height);
    }
    function paintImage(context, dimension, image, opacity) {
        if (!image) {
            return;
        }
        context.globalAlpha = opacity;
        context.drawImage(image, Constants_js_1.originPoint.x, Constants_js_1.originPoint.y, dimension.width, dimension.height);
        context.globalAlpha = 1;
    }
    function clear(context, dimension) {
        context.clearRect(Constants_js_1.originPoint.x, Constants_js_1.originPoint.y, dimension.width, dimension.height);
    }
    function drawParticle(data) {
        const { container, context, particle, delta, colorStyles, backgroundMask, composite, radius, opacity, shadow, transform, } = data, pos = particle.getPosition(), angle = particle.rotation + (particle.pathRotation ? particle.velocity.angle : Constants_js_1.defaultAngle), rotateData = {
            sin: Math.sin(angle),
            cos: Math.cos(angle),
        }, rotating = !!angle, transformData = {
            a: rotateData.cos * (transform.a ?? Constants_js_1.defaultTransform.a),
            b: rotating ? rotateData.sin * (transform.b ?? Constants_js_1.identity) : (transform.b ?? Constants_js_1.defaultTransform.b),
            c: rotating ? -rotateData.sin * (transform.c ?? Constants_js_1.identity) : (transform.c ?? Constants_js_1.defaultTransform.c),
            d: rotateData.cos * (transform.d ?? Constants_js_1.defaultTransform.d),
        };
        context.setTransform(transformData.a, transformData.b, transformData.c, transformData.d, pos.x, pos.y);
        if (backgroundMask) {
            context.globalCompositeOperation = composite;
        }
        const shadowColor = particle.shadowColor;
        if (shadow.enable && shadowColor) {
            context.shadowBlur = shadow.blur;
            context.shadowColor = (0, ColorUtils_js_1.getStyleFromRgb)(shadowColor);
            context.shadowOffsetX = shadow.offset.x;
            context.shadowOffsetY = shadow.offset.y;
        }
        if (colorStyles.fill) {
            context.fillStyle = colorStyles.fill;
        }
        const strokeWidth = particle.strokeWidth ?? Constants_js_1.minStrokeWidth;
        context.lineWidth = strokeWidth;
        if (colorStyles.stroke) {
            context.strokeStyle = colorStyles.stroke;
        }
        const drawData = {
            container,
            context,
            particle,
            radius,
            opacity,
            delta,
            transformData,
            strokeWidth,
        };
        drawShape(drawData);
        drawShapeAfterDraw(drawData);
        drawEffect(drawData);
        context.globalCompositeOperation = "source-over";
        context.resetTransform();
    }
    function drawEffect(data) {
        const { container, context, particle, radius, opacity, delta, transformData } = data;
        if (!particle.effect) {
            return;
        }
        const drawer = container.effectDrawers.get(particle.effect);
        if (!drawer) {
            return;
        }
        drawer.draw({
            context,
            particle,
            radius,
            opacity,
            delta,
            pixelRatio: container.retina.pixelRatio,
            transformData: { ...transformData },
        });
    }
    function drawShape(data) {
        const { container, context, particle, radius, opacity, delta, strokeWidth, transformData } = data;
        if (!particle.shape) {
            return;
        }
        const drawer = container.shapeDrawers.get(particle.shape);
        if (!drawer) {
            return;
        }
        context.beginPath();
        drawer.draw({
            context,
            particle,
            radius,
            opacity,
            delta,
            pixelRatio: container.retina.pixelRatio,
            transformData: { ...transformData },
        });
        if (particle.shapeClose) {
            context.closePath();
        }
        if (strokeWidth > Constants_js_1.minStrokeWidth) {
            context.stroke();
        }
        if (particle.shapeFill) {
            context.fill();
        }
    }
    function drawShapeAfterDraw(data) {
        const { container, context, particle, radius, opacity, delta, transformData } = data;
        if (!particle.shape) {
            return;
        }
        const drawer = container.shapeDrawers.get(particle.shape);
        if (!drawer?.afterDraw) {
            return;
        }
        drawer.afterDraw({
            context,
            particle,
            radius,
            opacity,
            delta,
            pixelRatio: container.retina.pixelRatio,
            transformData: { ...transformData },
        });
    }
    function drawPlugin(context, plugin, delta) {
        if (!plugin.draw) {
            return;
        }
        plugin.draw(context, delta);
    }
    function drawParticlePlugin(context, plugin, particle, delta) {
        if (!plugin.drawParticle) {
            return;
        }
        plugin.drawParticle(context, particle, delta);
    }
    function alterHsl(color, type, value) {
        return {
            h: color.h,
            s: color.s,
            l: color.l + (type === AlterType_js_1.AlterType.darken ? -Constants_js_1.lFactor : Constants_js_1.lFactor) * value,
        };
    }
});
