"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rangeColorToRgb = rangeColorToRgb;
exports.colorToRgb = colorToRgb;
exports.colorToHsl = colorToHsl;
exports.rangeColorToHsl = rangeColorToHsl;
exports.rgbToHsl = rgbToHsl;
exports.stringToAlpha = stringToAlpha;
exports.stringToRgb = stringToRgb;
exports.hslToRgb = hslToRgb;
exports.hslaToRgba = hslaToRgba;
exports.getRandomRgbColor = getRandomRgbColor;
exports.getStyleFromRgb = getStyleFromRgb;
exports.getStyleFromHsl = getStyleFromHsl;
exports.colorMix = colorMix;
exports.getLinkColor = getLinkColor;
exports.getLinkRandomColor = getLinkRandomColor;
exports.getHslFromAnimation = getHslFromAnimation;
exports.getHslAnimationFromHsl = getHslAnimationFromHsl;
exports.updateColorValue = updateColorValue;
exports.updateColor = updateColor;
const NumberUtils_js_1 = require("./NumberUtils.js");
const Constants_js_1 = require("../Core/Utils/Constants.js");
const TypeUtils_js_1 = require("./TypeUtils.js");
const AnimationStatus_js_1 = require("../Enums/AnimationStatus.js");
const Utils_js_1 = require("./Utils.js");
function stringToRgba(engine, input) {
    if (!input) {
        return;
    }
    for (const manager of engine.colorManagers.values()) {
        if (input.startsWith(manager.stringPrefix)) {
            return manager.parseString(input);
        }
    }
}
function rangeColorToRgb(engine, input, index, useIndex = true) {
    if (!input) {
        return;
    }
    const color = (0, TypeUtils_js_1.isString)(input) ? { value: input } : input;
    if ((0, TypeUtils_js_1.isString)(color.value)) {
        return colorToRgb(engine, color.value, index, useIndex);
    }
    if ((0, TypeUtils_js_1.isArray)(color.value)) {
        return rangeColorToRgb(engine, {
            value: (0, Utils_js_1.itemFromArray)(color.value, index, useIndex),
        });
    }
    for (const manager of engine.colorManagers.values()) {
        const res = manager.handleRangeColor(color);
        if (res) {
            return res;
        }
    }
}
function colorToRgb(engine, input, index, useIndex = true) {
    if (!input) {
        return;
    }
    const color = (0, TypeUtils_js_1.isString)(input) ? { value: input } : input;
    if ((0, TypeUtils_js_1.isString)(color.value)) {
        return color.value === Constants_js_1.randomColorValue ? getRandomRgbColor() : stringToRgb(engine, color.value);
    }
    if ((0, TypeUtils_js_1.isArray)(color.value)) {
        return colorToRgb(engine, {
            value: (0, Utils_js_1.itemFromArray)(color.value, index, useIndex),
        });
    }
    for (const manager of engine.colorManagers.values()) {
        const res = manager.handleColor(color);
        if (res) {
            return res;
        }
    }
}
function colorToHsl(engine, color, index, useIndex = true) {
    const rgb = colorToRgb(engine, color, index, useIndex);
    return rgb ? rgbToHsl(rgb) : undefined;
}
function rangeColorToHsl(engine, color, index, useIndex = true) {
    const rgb = rangeColorToRgb(engine, color, index, useIndex);
    return rgb ? rgbToHsl(rgb) : undefined;
}
function rgbToHsl(color) {
    const r1 = color.r / Constants_js_1.rgbMax, g1 = color.g / Constants_js_1.rgbMax, b1 = color.b / Constants_js_1.rgbMax, max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1), res = {
        h: Constants_js_1.hMin,
        l: (max + min) * Constants_js_1.half,
        s: Constants_js_1.sMin,
    };
    if (max !== min) {
        res.s = res.l < Constants_js_1.half ? (max - min) / (max + min) : (max - min) / (Constants_js_1.double - max - min);
        res.h =
            r1 === max
                ? (g1 - b1) / (max - min)
                : (res.h = g1 === max ? Constants_js_1.double + (b1 - r1) / (max - min) : Constants_js_1.double * Constants_js_1.double + (r1 - g1) / (max - min));
    }
    res.l *= Constants_js_1.lMax;
    res.s *= Constants_js_1.sMax;
    res.h *= Constants_js_1.hPhase;
    if (res.h < Constants_js_1.hMin) {
        res.h += Constants_js_1.hMax;
    }
    if (res.h >= Constants_js_1.hMax) {
        res.h -= Constants_js_1.hMax;
    }
    return res;
}
function stringToAlpha(engine, input) {
    return stringToRgba(engine, input)?.a;
}
function stringToRgb(engine, input) {
    return stringToRgba(engine, input);
}
function hslToRgb(hsl) {
    const h = ((hsl.h % Constants_js_1.hMax) + Constants_js_1.hMax) % Constants_js_1.hMax, s = Math.max(Constants_js_1.sMin, Math.min(Constants_js_1.sMax, hsl.s)), l = Math.max(Constants_js_1.lMin, Math.min(Constants_js_1.lMax, hsl.l)), hNormalized = h / Constants_js_1.hMax, sNormalized = s / Constants_js_1.sMax, lNormalized = l / Constants_js_1.lMax;
    if (s === Constants_js_1.sMin) {
        const grayscaleValue = Math.round(lNormalized * Constants_js_1.rgbFactor);
        return { r: grayscaleValue, g: grayscaleValue, b: grayscaleValue };
    }
    const channel = (temp1, temp2, temp3) => {
        const temp3Min = 0, temp3Max = 1;
        if (temp3 < temp3Min) {
            temp3++;
        }
        if (temp3 > temp3Max) {
            temp3--;
        }
        if (temp3 * Constants_js_1.sextuple < temp3Max) {
            return temp1 + (temp2 - temp1) * Constants_js_1.sextuple * temp3;
        }
        if (temp3 * Constants_js_1.double < temp3Max) {
            return temp2;
        }
        if (temp3 * Constants_js_1.triple < temp3Max * Constants_js_1.double) {
            const temp3Offset = Constants_js_1.double / Constants_js_1.triple;
            return temp1 + (temp2 - temp1) * (temp3Offset - temp3) * Constants_js_1.sextuple;
        }
        return temp1;
    }, temp1 = lNormalized < Constants_js_1.half
        ? lNormalized * (Constants_js_1.sNormalizedOffset + sNormalized)
        : lNormalized + sNormalized - lNormalized * sNormalized, temp2 = Constants_js_1.double * lNormalized - temp1, phaseThird = Constants_js_1.phaseNumerator / Constants_js_1.triple, red = Math.min(Constants_js_1.rgbFactor, Constants_js_1.rgbFactor * channel(temp2, temp1, hNormalized + phaseThird)), green = Math.min(Constants_js_1.rgbFactor, Constants_js_1.rgbFactor * channel(temp2, temp1, hNormalized)), blue = Math.min(Constants_js_1.rgbFactor, Constants_js_1.rgbFactor * channel(temp2, temp1, hNormalized - phaseThird));
    return { r: Math.round(red), g: Math.round(green), b: Math.round(blue) };
}
function hslaToRgba(hsla) {
    const rgbResult = hslToRgb(hsla);
    return {
        a: hsla.a,
        b: rgbResult.b,
        g: rgbResult.g,
        r: rgbResult.r,
    };
}
function getRandomRgbColor(min) {
    const fixedMin = min ?? Constants_js_1.defaultRgbMin, fixedMax = Constants_js_1.rgbMax + Constants_js_1.identity;
    return {
        b: Math.floor((0, NumberUtils_js_1.randomInRange)((0, NumberUtils_js_1.setRangeValue)(fixedMin, fixedMax))),
        g: Math.floor((0, NumberUtils_js_1.randomInRange)((0, NumberUtils_js_1.setRangeValue)(fixedMin, fixedMax))),
        r: Math.floor((0, NumberUtils_js_1.randomInRange)((0, NumberUtils_js_1.setRangeValue)(fixedMin, fixedMax))),
    };
}
function getStyleFromRgb(color, opacity) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity ?? Constants_js_1.defaultOpacity})`;
}
function getStyleFromHsl(color, opacity) {
    return `hsla(${color.h}, ${color.s}%, ${color.l}%, ${opacity ?? Constants_js_1.defaultOpacity})`;
}
function colorMix(color1, color2, size1, size2) {
    let rgb1 = color1, rgb2 = color2;
    if (rgb1.r === undefined) {
        rgb1 = hslToRgb(color1);
    }
    if (rgb2.r === undefined) {
        rgb2 = hslToRgb(color2);
    }
    return {
        b: (0, NumberUtils_js_1.mix)(rgb1.b, rgb2.b, size1, size2),
        g: (0, NumberUtils_js_1.mix)(rgb1.g, rgb2.g, size1, size2),
        r: (0, NumberUtils_js_1.mix)(rgb1.r, rgb2.r, size1, size2),
    };
}
function getLinkColor(p1, p2, linkColor) {
    if (linkColor === Constants_js_1.randomColorValue) {
        return getRandomRgbColor();
    }
    else if (linkColor === Constants_js_1.midColorValue) {
        const sourceColor = p1.getFillColor() ?? p1.getStrokeColor(), destColor = p2?.getFillColor() ?? p2?.getStrokeColor();
        if (sourceColor && destColor && p2) {
            return colorMix(sourceColor, destColor, p1.getRadius(), p2.getRadius());
        }
        else {
            const hslColor = sourceColor ?? destColor;
            if (hslColor) {
                return hslToRgb(hslColor);
            }
        }
    }
    else {
        return linkColor;
    }
}
function getLinkRandomColor(engine, optColor, blink, consent) {
    const color = (0, TypeUtils_js_1.isString)(optColor) ? optColor : optColor.value;
    if (color === Constants_js_1.randomColorValue) {
        if (consent) {
            return rangeColorToRgb(engine, {
                value: color,
            });
        }
        if (blink) {
            return Constants_js_1.randomColorValue;
        }
        return Constants_js_1.midColorValue;
    }
    else if (color === Constants_js_1.midColorValue) {
        return Constants_js_1.midColorValue;
    }
    else {
        return rangeColorToRgb(engine, {
            value: color,
        });
    }
}
function getHslFromAnimation(animation) {
    return animation !== undefined
        ? {
            h: animation.h.value,
            s: animation.s.value,
            l: animation.l.value,
        }
        : undefined;
}
function getHslAnimationFromHsl(hsl, animationOptions, reduceFactor) {
    const resColor = {
        h: {
            enable: false,
            value: hsl.h,
        },
        s: {
            enable: false,
            value: hsl.s,
        },
        l: {
            enable: false,
            value: hsl.l,
        },
    };
    if (animationOptions) {
        setColorAnimation(resColor.h, animationOptions.h, reduceFactor);
        setColorAnimation(resColor.s, animationOptions.s, reduceFactor);
        setColorAnimation(resColor.l, animationOptions.l, reduceFactor);
    }
    return resColor;
}
function setColorAnimation(colorValue, colorAnimation, reduceFactor) {
    colorValue.enable = colorAnimation.enable;
    if (colorValue.enable) {
        colorValue.velocity = ((0, NumberUtils_js_1.getRangeValue)(colorAnimation.speed) / Constants_js_1.percentDenominator) * reduceFactor;
        colorValue.decay = Constants_js_1.decayOffset - (0, NumberUtils_js_1.getRangeValue)(colorAnimation.decay);
        colorValue.status = AnimationStatus_js_1.AnimationStatus.increasing;
        colorValue.loops = Constants_js_1.defaultLoops;
        colorValue.maxLoops = (0, NumberUtils_js_1.getRangeValue)(colorAnimation.count);
        colorValue.time = Constants_js_1.defaultTime;
        colorValue.delayTime = (0, NumberUtils_js_1.getRangeValue)(colorAnimation.delay) * Constants_js_1.millisecondsToSeconds;
        if (!colorAnimation.sync) {
            colorValue.velocity *= (0, NumberUtils_js_1.getRandom)();
            colorValue.value *= (0, NumberUtils_js_1.getRandom)();
        }
        colorValue.initialValue = colorValue.value;
        colorValue.offset = (0, NumberUtils_js_1.setRangeValue)(colorAnimation.offset);
    }
    else {
        colorValue.velocity = Constants_js_1.defaultVelocity;
    }
}
function updateColorValue(data, range, decrease, delta) {
    const minLoops = 0, minDelay = 0, identity = 1, minVelocity = 0, minOffset = 0, velocityFactor = 3.6;
    if (!data ||
        !data.enable ||
        ((data.maxLoops ?? minLoops) > minLoops && (data.loops ?? minLoops) > (data.maxLoops ?? minLoops))) {
        return;
    }
    if (!data.time) {
        data.time = 0;
    }
    if ((data.delayTime ?? minDelay) > minDelay && data.time < (data.delayTime ?? minDelay)) {
        data.time += delta.value;
    }
    if ((data.delayTime ?? minDelay) > minDelay && data.time < (data.delayTime ?? minDelay)) {
        return;
    }
    const offset = data.offset ? (0, NumberUtils_js_1.randomInRange)(data.offset) : minOffset, velocity = (data.velocity ?? minVelocity) * delta.factor + offset * velocityFactor, decay = data.decay ?? identity, max = (0, NumberUtils_js_1.getRangeMax)(range), min = (0, NumberUtils_js_1.getRangeMin)(range);
    if (!decrease || data.status === AnimationStatus_js_1.AnimationStatus.increasing) {
        data.value += velocity;
        if (data.value > max) {
            if (!data.loops) {
                data.loops = 0;
            }
            data.loops++;
            if (decrease) {
                data.status = AnimationStatus_js_1.AnimationStatus.decreasing;
            }
            else {
                data.value -= max;
            }
        }
    }
    else {
        data.value -= velocity;
        const minValue = 0;
        if (data.value < minValue) {
            if (!data.loops) {
                data.loops = 0;
            }
            data.loops++;
            data.status = AnimationStatus_js_1.AnimationStatus.increasing;
        }
    }
    if (data.velocity && decay !== identity) {
        data.velocity *= decay;
    }
    data.value = (0, NumberUtils_js_1.clamp)(data.value, min, max);
}
function updateColor(color, delta) {
    if (!color) {
        return;
    }
    const { h, s, l } = color, ranges = {
        h: { min: 0, max: 360 },
        s: { min: 0, max: 100 },
        l: { min: 0, max: 100 },
    };
    if (h) {
        updateColorValue(h, ranges.h, false, delta);
    }
    if (s) {
        updateColorValue(s, ranges.s, true, delta);
    }
    if (l) {
        updateColorValue(l, ranges.l, true, delta);
    }
}
