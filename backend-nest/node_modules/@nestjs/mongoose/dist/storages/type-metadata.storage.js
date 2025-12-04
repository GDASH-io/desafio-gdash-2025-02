"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeMetadataStorage = exports.TypeMetadataStorageHost = void 0;
const is_target_equal_util_1 = require("../utils/is-target-equal-util");
class TypeMetadataStorageHost {
    constructor() {
        this.schemas = new Array();
        this.properties = new Array();
        this.virtuals = new Array();
    }
    addPropertyMetadata(metadata) {
        this.properties.unshift(metadata);
    }
    addSchemaMetadata(metadata) {
        this.compileClassMetadata(metadata);
        this.schemas.push(metadata);
    }
    addVirtualMetadata(metadata) {
        this.virtuals.push(metadata);
    }
    getSchemaMetadataByTarget(target) {
        return this.schemas.find((item) => item.target === target);
    }
    compileClassMetadata(metadata) {
        const belongsToClass = is_target_equal_util_1.isTargetEqual.bind(undefined, metadata);
        if (!metadata.properties) {
            metadata.properties = this.getClassFieldsByPredicate(belongsToClass);
        }
    }
    getClassFieldsByPredicate(belongsToClass) {
        return this.properties.filter(belongsToClass);
    }
    getVirtualsMetadataByTarget(targetFilter) {
        return this.virtuals.filter(({ target }) => target === targetFilter);
    }
}
exports.TypeMetadataStorageHost = TypeMetadataStorageHost;
const globalRef = global;
exports.TypeMetadataStorage = globalRef.MongoTypeMetadataStorage ||
    (globalRef.MongoTypeMetadataStorage = new TypeMetadataStorageHost());
