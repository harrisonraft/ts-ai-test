import { IPrompt } from "../Prompt/interfaces/IPrompt";
import { PromptExecutor } from "../types/PromptExecutor";
import { ValidationResolver } from "../Validators/ValidationResolver";
import { ValidatorResult } from "../Validators/types/ValidatorResult";

export class SimpleTestCase<TExpectedOutput> {
    private prompts: Array<IPrompt<TExpectedOutput>>;
    private executor: PromptExecutor;
    private validationResolver: ValidationResolver;

    constructor(prompts: Array<IPrompt<TExpectedOutput>>, executor: PromptExecutor) {
        this.prompts = prompts;
        this.executor = executor;
        this.validationResolver = new ValidationResolver();
    }

    public async run() {
        const promises = this.prompts.map((p) => {
            return this.executor(p.prompt).then((llmOutput) => {
                return this.validateOutput(p, llmOutput);
            }).catch((e) => {
                this.log(e);
                return {
                    isValid: false,
                    score: 0
                } as ValidatorResult
            });
        });
    }

    private validateOutput(prompt: IPrompt<TExpectedOutput>, llmOutput: string): ValidatorResult {
        const mappedOutput = prompt.mapToExpectedOutput(llmOutput);
        return this.validationResolver.validate(mappedOutput, prompt.expectedOutput);
    }

    private log(e: unknown) {
        console.error(`${e}`);
    }
}
