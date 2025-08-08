import { ValidatorResult } from "./types/ValidatorResult";

export class ValidationResolver {
    public validate<T>(input: T, expectedOutput: T): ValidatorResult {
        // do something based on type of input being: object, array, string, number, etc.
        if (typeof input !== typeof expectedOutput) {
            return {
                score: 0,
                isValid: false,
            };
        }

        if (Array.isArray(input) && Array.isArray(expectedOutput)) {
            // Handle array validation logic here
            return this.validateArray(input, expectedOutput);
        } else if (typeof input === "object" && typeof expectedOutput === "object") {
            // Handle object validation logic here
            return this.validateObject(input, expectedOutput);
        } else {
            // Handle primitive types (string, number, boolean)
            return this.validatePrimitive(input, expectedOutput);
        }
    }
}
