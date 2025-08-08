import { ValidatorResult } from "./ValidatorResult";

export type Validator<T> = (input: T, expectedOutput: T) => ValidatorResult
