import { IValidator } from "./interfaces/IValidator";
import { ValidatorResult } from "./types/ValidatorResult";

export class LLMValidator<TOutput> implements IValidator<TOutput> {
    constructor(
        private llmExecutor: (llmOutput: TOutput, expectedOutput: TOutput) => Promise<ValidatorResult>
    ) {}

    public async validate(llmOutput: TOutput, expectedOutput: TOutput, validationRequirement: number): Promise<ValidatorResult> {
        try {
            const data = await this.llmExecutor(llmOutput, expectedOutput)
            return data;
        } catch(e) {
            console.error("Call to executor in LLMValidator failed: ", e);

            return {
                isValid: false,
                score: 0
            }
        }
    }
}
