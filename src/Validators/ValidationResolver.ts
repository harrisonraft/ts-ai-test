import { ValidatorResult } from "./types/ValidatorResult";
import { ArrayValidator } from "./ArrayValidator";
import { ObjectLikenessScore } from "./utils/ObjectLikenessScore";
import { isObject } from "./utils/IsObject";

export class ValidationResolver {
    public validate<T>(realOutput: T, expectedOutput: T, validationRequirement: number = 100): ValidatorResult {
        if (typeof realOutput !== typeof expectedOutput) {
            return {
                score: 0,
                isValid: false,
            };
        }

        if (Array.isArray(realOutput) && Array.isArray(expectedOutput)) {
            return ArrayValidator(realOutput, expectedOutput);
        }

        if (isObject(realOutput) && isObject(expectedOutput)) {
            const objectScore = ObjectLikenessScore(realOutput, expectedOutput)
            return {
                isValid: objectScore.score >= validationRequirement,
                score: objectScore.score
            }
        }

        // Handle primitive case
        return realOutput === expectedOutput ? {
            isValid: true,
            score: 100
        } : {
            isValid: false,
            score: 0
        };
    }
}
