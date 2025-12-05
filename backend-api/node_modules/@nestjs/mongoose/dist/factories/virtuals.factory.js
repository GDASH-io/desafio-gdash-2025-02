"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualsFactory = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const type_metadata_storage_1 = require("../storages/type-metadata.storage");
class VirtualsFactory {
    static inspect(target, schema) {
        let parent = target;
        while (!(0, shared_utils_1.isUndefined)(parent.prototype)) {
            if (parent === Function.prototype) {
                break;
            }
            const virtuals = type_metadata_storage_1.TypeMetadataStorage.getVirtualsMetadataByTarget(parent);
            virtuals.forEach(({ options, name, getter, setter }) => {
                const virtual = schema.virtual(name, options);
                if (getter) {
                    virtual.get(getter);
                }
                if (setter) {
                    virtual.set(setter);
                }
            });
            parent = Object.getPrototypeOf(parent);
        }
    }
}
exports.VirtualsFactory = VirtualsFactory;
//# sourceMappingURL=virtuals.factory.js.map