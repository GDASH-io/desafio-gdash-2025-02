"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTargetEqual = isTargetEqual;
function isTargetEqual(a, b) {
    return (a.target === b.target ||
        (a.target.prototype
            ? isTargetEqual({ target: a.target.__proto__ }, b)
            : false));
}
//# sourceMappingURL=is-target-equal-util.js.map