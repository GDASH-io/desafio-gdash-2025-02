"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualsFactory = void 0;
const type_metadata_storage_1 = require("../storages/type-metadata.storage");
class VirtualsFactory {
    static inspect(target, schema) {
        const virtuals = type_metadata_storage_1.TypeMetadataStorage.getVirtualsMetadataByTarget(target);
        virtuals.forEach(({ options, name, getter, setter }) => {
            const virtual = schema.virtual(name, options);
            if (getter) {
                virtual.get(getter);
            }
            if (setter) {
                virtual.set(setter);
            }
        });
    }
}
exports.VirtualsFactory = VirtualsFactory;
