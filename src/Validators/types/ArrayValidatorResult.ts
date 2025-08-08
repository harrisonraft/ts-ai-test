import { ValidatorResult } from "./ValidatorResult";

export type ArrayValidatorResult<T extends Array<any>> = {
    additions: Array<unknown>;
    missing: T;
} & ValidatorResult;
