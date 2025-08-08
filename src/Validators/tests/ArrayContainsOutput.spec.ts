import { ArrayContainsPrimitiveOutputs } from "../ArrayContainsPrimitiveOutputs";
import { ArrayValidatorResult } from "../types/ArrayValidatorResult";
import { CalculateF1Score } from "../utils/CalculateF1Score";

describe("When using the ArrayContainsOutput Validator", () => {

    describe("When the input and output array are the same", () => {
        let inputArray: Array<unknown>;
        let expectedOutput: Array<unknown>;
        let expectedValidationResult: ArrayValidatorResult<any> = {
            isValid: true,
            score: 100,
            additions: [],
            missing: []
        };

        beforeEach(() => {
            inputArray = [1, 2, 3, "a", "b", "c"];
            expectedOutput = [1, 2, 3, "a", "b", "c"];
        });

        test("then it should be completely valid", () => {
            expect(ArrayContainsPrimitiveOutputs(inputArray, expectedOutput)).toEqual(expectedValidationResult);
        });
    });

    describe("When the input array has additional items not in the expected output", () => {
        let inputArray: Array<unknown>;
        let expectedOutput: Array<unknown>;
        let expectedValidationResult: ArrayValidatorResult<any> = {
            isValid: false,
            score: CalculateF1Score(3, 3, 1), // 86%
            additions: ["d"],
            missing: []
        };

        beforeEach(() => {
            inputArray = ["a", "b", "c", "d"];
            expectedOutput = ["a", "b", "c"];
        });

        test("then it should be invalid, with the additional item(s) provided", () => {
            expect(ArrayContainsPrimitiveOutputs(inputArray, expectedOutput)).toEqual(expectedValidationResult);
        });
    });

    describe("when the input array is empty, and the expected output is not", () => {
        let inputArray: Array<unknown>;
        let expectedOutput: Array<unknown>;
        let expectedValidationResult: ArrayValidatorResult<any> = {
            isValid: false,
            score: 0,
            additions: [],
            missing: ["a", "b", "c"]
        };

        beforeEach(() => {
            inputArray = [];
            expectedOutput = ["a", "b", "c"];
        });

        test("then it should be invalid, with the additional item(s) provided, and a score of 0", () => {
            expect(ArrayContainsPrimitiveOutputs(inputArray, expectedOutput)).toEqual(expectedValidationResult);
        });
    })
});
