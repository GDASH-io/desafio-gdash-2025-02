export declare type JsonPrimitive = string | number | boolean | null;
export declare type JsonKey = string | number | undefined;
export declare type JsonObject = {
    [key: string]: JsonPrimitive | JsonStruct;
};
export declare type JsonArray = (JsonPrimitive | JsonStruct)[];
export declare type JsonStruct = JsonObject | JsonArray;
