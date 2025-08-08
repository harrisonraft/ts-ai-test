import { ValidatorResult } from "./types/ValidatorResult";
import { ArrayContainsPrimitiveOutputs } from "./ArrayContainsPrimitiveOutputs";

const isPrimitive = (value: any): boolean => {
    return value === null || (typeof value !== 'object' && typeof value !== 'function');
}

export const ArrayValidator = <T extends Array<any>>(input: T, expectedOutput: T): ValidatorResult => {
    if (!Array.isArray(input) || !Array.isArray(expectedOutput)) {
        return {
            isValid: false,
            score: 0
        };
    }

    const allItemsPrimitive = input.every(isPrimitive);

    if (allItemsPrimitive) {
        // TODO - want to support this?
        // ... handle non-primitive arrays if needed. We will do a switch based on type...
    }

    return ArrayContainsPrimitiveOutputs<T>(input, expectedOutput);
}
