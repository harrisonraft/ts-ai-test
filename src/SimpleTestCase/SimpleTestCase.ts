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

    public async run(): Promise<void> {
        const promises = this.prompts.map((p, i) => {
            return this.executor(p.prompt).then((llmOutput) => {
                const result = this.validateOutput(p, llmOutput);
                console.log(`==== Result for prompt #${i} ====`);
                if (result.isValid) {
                    console.log(`With user prompt: ${JSON.stringify(p.prompt)}`);
                    console.log(`Result score: ${result.score} / 100`);
                } else {
                    console.log(`%c With user prompt: ${p.prompt}`, "color: red; font-weight: bold;");
                    console.log(`%c With LLM output: ${llmOutput}`, "color: red; font-weight: bold;");
                    console.log(`%c Result score: ${result.score} / 100`, "color: red; font-weight: bold;");
                }

                return result;
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
