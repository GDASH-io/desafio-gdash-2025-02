"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaFactory = void 0;
const mongoose = require("mongoose");
const type_metadata_storage_1 = require("../storages/type-metadata.storage");
const definitions_factory_1 = require("./definitions.factory");
const virtuals_factory_1 = require("./virtuals.factory");
class SchemaFactory {
    static createForClass(target) {
        const schemaDefinition = definitions_factory_1.DefinitionsFactory.createForClass(target);
        const schemaMetadata = type_metadata_storage_1.TypeMetadataStorage.getSchemaMetadataByTarget(target);
        const schemaOpts = schemaMetadata?.options;
        const schema = new mongoose.Schema(schemaDefinition, schemaOpts);
        virtuals_factory_1.VirtualsFactory.inspect(target, schema);
        return schema;
    }
}
exports.SchemaFactory = SchemaFactory;
//# sourceMappingURL=schema.factory.js.map