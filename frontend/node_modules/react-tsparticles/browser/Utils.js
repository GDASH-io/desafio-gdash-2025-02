const isObject = (val) => typeof val === "object" && val !== null;
export function deepCompare(obj1, obj2, excludeKeyFn = () => false) {
    if (!isObject(obj1) || !isObject(obj2)) {
        return obj1 === obj2;
    }
    const keys1 = Object.keys(obj1).filter(key => !excludeKeyFn(key)), keys2 = Object.keys(obj2).filter(key => !excludeKeyFn(key));
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (const key of keys1) {
        const value1 = obj1[key], value2 = obj2[key];
        if (isObject(value1) && isObject(value2)) {
            if (value1 === obj2 && value2 === obj1) {
                continue;
            }
            if (!deepCompare(value1, value2, excludeKeyFn)) {
                return false;
            }
        }
        else if (Array.isArray(value1) && Array.isArray(value2)) {
            if (!deepCompareArrays(value1, value2, excludeKeyFn)) {
                return false;
            }
        }
        else if (value1 !== value2) {
            return false;
        }
    }
    return true;
}
function deepCompareArrays(arr1, arr2, excludeKeyFn) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        const val1 = arr1[i], val2 = arr2[i];
        if (Array.isArray(val1) && Array.isArray(val2)) {
            if (!deepCompareArrays(val1, val2, excludeKeyFn)) {
                return false;
            }
        }
        else if (isObject(val1) && isObject(val2)) {
            if (!deepCompare(val1, val2, excludeKeyFn)) {
                return false;
            }
        }
        else if (val1 !== val2) {
            return false;
        }
    }
    return true;
}
