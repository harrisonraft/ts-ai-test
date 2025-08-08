import { ArrayValidatorResult } from "./types/ArrayValidatorResult";
import { CalculateF1Score } from "./utils/CalculateF1Score";

const PrimitiveList = ["number", "string", "boolean"];

/**
 * We want to take any given Array, and step through the items, and compare them to the expected output.
 * If all items match all expected items, then we return a score of 100% and isValid true.
 *
 * If some items do not match, we calculate a score based on the number of items that match vs the total number of items in the expected output.
 *
 * If some items exist that are not in the expected output, we will calculate the score based on the number of items and subtract the number of items that do not match.
 *
 * If no items match, we return a score of 0% and isValid false.
 *
 * Order should not matter
 */

export const ArrayContainsPrimitiveOutputs = <TExpectedOutput>(inputArray: Array<unknown>, expectedOutput: Array<TExpectedOutput>): ArrayValidatorResult<Array<TExpectedOutput>> => {
    const validated: ArrayValidatorResult<Array<TExpectedOutput>> = {
        score: 0,
        additions: [],
        missing: [],
        isValid: false
    }

    const matchedIdxSet = new Set<number>();

    let i = 0;

    for (const item of expectedOutput) {
        if (PrimitiveList.includes(typeof item)) {
            const idxOfMatch = inputArray.findIndex(e => e === inputArray[i]);

            if (idxOfMatch > -1) {
                matchedIdxSet.add(idxOfMatch);
            } else {
                validated.missing.push(item);
            }
        }

        i++;
    }

    let c = 0;
    for (const item of inputArray) {
        if (matchedIdxSet.has(c)) {
            c++;
            continue;
        }

        validated.additions.push(item);
        c++;
    }

    const numMatches = matchedIdxSet.size;
    const numAdditions = validated.additions.length;
    const numMissing = validated.missing.length;

    validated.score = CalculateF1Score(expectedOutput.length, numMatches, numAdditions);

    if (numMatches === expectedOutput.length && !numAdditions && !numMissing) {
        validated.isValid = true;
    }

    return validated;
}
