"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsObjectIdPipe = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
let IsObjectIdPipe = class IsObjectIdPipe {
    transform(value) {
        const isValidObjectId = mongoose_1.Types.ObjectId.isValid(value);
        if (!isValidObjectId) {
            throw new common_1.BadRequestException(`Invalid ObjectId: '${value}' is not a valid MongoDB ObjectId`);
        }
        return value;
    }
};
exports.IsObjectIdPipe = IsObjectIdPipe;
exports.IsObjectIdPipe = IsObjectIdPipe = __decorate([
    (0, common_1.Injectable)()
], IsObjectIdPipe);
//# sourceMappingURL=is-object-id.pipe.js.map