"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Virtual = Virtual;
const type_metadata_storage_1 = require("../storages/type-metadata.storage");
function Virtual(options) {
    return (target, propertyKey) => {
        type_metadata_storage_1.TypeMetadataStorage.addVirtualMetadata({
            target: target.constructor,
            options: options?.options,
            name: propertyKey.toString() +
                (options?.subPath ? `.${options.subPath}` : ''),
            setter: options?.set,
            getter: options?.get,
        });
    };
}
//# sourceMappingURL=virtual.decorator.js.map