import { ValidatorResult } from "../types/ValidatorResult";

export const LLMResponseToValidationResult = (response: string): ValidatorResult => {
    const parsedResponse = JSON.parse(response);

    if (parsedResponse && typeof parsedResponse.score === 'number' && typeof parsedResponse.isValid === 'boolean') {
        return {
            score: parsedResponse.score,
            isValid: parsedResponse.isValid
        };
    }

    throw new Error("Invalid response format");
}
