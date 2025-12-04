import { Type } from '@nestjs/common';
import { PropertyMetadata } from '../metadata/property-metadata.interface';
import { SchemaMetadata } from '../metadata/schema-metadata.interface';
import { VirtualMetadataInterface } from '../metadata/virtual-metadata.interface';
export declare class TypeMetadataStorageHost {
    private schemas;
    private properties;
    private virtuals;
    addPropertyMetadata(metadata: PropertyMetadata): void;
    addSchemaMetadata(metadata: SchemaMetadata): void;
    addVirtualMetadata(metadata: VirtualMetadataInterface): void;
    getSchemaMetadataByTarget(target: Type<unknown>): SchemaMetadata | undefined;
    private compileClassMetadata;
    private getClassFieldsByPredicate;
    getVirtualsMetadataByTarget<TClass>(targetFilter: Type<TClass>): VirtualMetadataInterface[];
}
export declare const TypeMetadataStorage: TypeMetadataStorageHost;
