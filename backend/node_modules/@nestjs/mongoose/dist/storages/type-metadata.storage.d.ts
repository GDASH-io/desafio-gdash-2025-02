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
    getVirtualsMetadataByTarget<TClass>(targetFilter: Type<TClass>): VirtualMetadataInterface[];
    private compileClassMetadata;
    private getClassFieldsByPredicate;
}
export declare const TypeMetadataStorage: TypeMetadataStorageHost;
