import { ValidatorResult } from "../types/ValidatorResult";

export interface IValidator<T> {
    validate(realOutput: T, expectedOutput: T, validationRequirement: number): Promise<ValidatorResult>
}
