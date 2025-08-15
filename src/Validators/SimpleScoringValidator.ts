import { ValidatorResult } from "./types/ValidatorResult";
import { ArrayValidator } from "./ArrayValidator";
import { ObjectLikenessScore } from "./utils/ObjectLikenessScore";
import { isObject } from "./utils/IsObject";
import { IValidator } from "./interfaces/IValidator";

export class SimpleScoringValidator<TOutput> implements IValidator<TOutput> {
    public validate(realOutput: TOutput, expectedOutput: TOutput, validationRequirement: number = 100): Promise<ValidatorResult> {
        if (typeof realOutput !== typeof expectedOutput) {
            return Promise.resolve({
                score: 0,
                isValid: false,
            });
        }

        if (Array.isArray(realOutput) && Array.isArray(expectedOutput)) {
            return Promise.resolve(ArrayValidator(realOutput, expectedOutput));
        }

        if (isObject(realOutput) && isObject(expectedOutput)) {
            const objectScore = ObjectLikenessScore(realOutput, expectedOutput)
            return Promise.resolve({
                isValid: objectScore.score >= validationRequirement,
                score: objectScore.score
            });
        }

        // Handle primitive case
        return Promise.resolve(realOutput === expectedOutput ? {
            isValid: true,
            score: 100
        } : {
            isValid: false,
            score: 0
        });
    }
}
