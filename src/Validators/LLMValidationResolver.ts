import { ValidatorResult } from "./types/ValidatorResult";
import { LLMPrompt } from "../PromptFactories/types/LLMPrompt";
import { LLMResponseToValidationResult } from "./utils/LLMResponseToValidationResult";

export class LLMValidationResolver {
    constructor(
        private promptExecutor: (prompt: LLMPrompt) => Promise<string>
    ) {}

    public validate<T>(realOutput: T, expectedOutput: T, validationPromptFactory: (input: T, expectedOutput: T) => LLMPrompt): Promise<ValidatorResult> {
        // we offload the validation logic to a prompt factory + LLM call
        const prompt = validationPromptFactory(realOutput, expectedOutput);

        return this.promptExecutor(prompt).then(LLMResponseToValidationResult);
    }
}
