import { IPrompt } from "../Prompt/interfaces/IPrompt";
import { PromptExecutor } from "../types/PromptExecutor";
import { ValidationResolver } from "../Validators/ValidationResolver";
import { ValidatorResult } from "../Validators/types/ValidatorResult";

type Result<TExpectedOutput> = {
    prompt: IPrompt<TExpectedOutput>,
    llmOutput: string,
    mappedOutput?: TExpectedOutput
} & ValidatorResult;

export class SimpleTestCase<TExpectedOutput> {
    private validationResolver: ValidationResolver;

    constructor(
        private identifier: string,
        private prompts: Array<IPrompt<TExpectedOutput>>,
        private executor: PromptExecutor,
        private runs: number = 3,
        private validationRequirement: number = 100
    ) {
        this.validationResolver = new ValidationResolver();
    }

    public async run(): Promise<void> {
        const runs: Array<Promise<Array<Result<TExpectedOutput>>>> = [];

        for (let i = 0; i < this.runs; i++) {
            runs.push(Promise.all(this.prompts.map((p, i) => {
                return this.executor(p.prompt).then((llmOutput) => {
                    const mappedOutput = p.mapToExpectedOutput(llmOutput);
                    const validation = this.validationResolver.validate(mappedOutput, p.expectedOutput, this.validationRequirement);

                    return {
                        prompt: p,
                        llmOutput: llmOutput,
                        mappedOutput: mappedOutput,
                        ...validation
                    };
                }).catch((e) => {
                    this.log(e);
                    return {
                        prompt: p,
                        llmOutput: "",
                        isValid: false,
                        score: 0
                    };
                });
            })));
        }

        this.logRuns(await Promise.all(runs));
    }

    private log(e: unknown) {
        console.error(`${e}`);
    }

    private logRuns(runs: Array<Array<Result<TExpectedOutput>>>) {
        let i = 1;
        let c = 1;

        console.log(JSON.stringify(runs[0][0].score));

        console.log(`========================================`);
        console.log(`Results for Test Case: ${this.identifier}`);
        console.log(`========================================`);
        console.log();

        for (const r of runs) {
            for (const result of r) {
                console.log();
                console.log(`--- Run ${i} - Prompt ${c} ---`);
                if (result.isValid) {
                    console.log(`Prompt: ${c} - Passed with score: ${result.score} / 100`);
                    console.log(`Expected Output: ${JSON.stringify(result.prompt.expectedOutput)}`);
                    console.log(`Mapped Output: ${JSON.stringify(result.mappedOutput)}`);
                } else {
                    console.error(`Prompt: ${c} - Failed with score: ${result.score} / 100`);
                    console.error(`Expected Output: ${JSON.stringify(result.prompt.expectedOutput)}`);
                    console.error(`Mapped Output: ${JSON.stringify(result.mappedOutput)}`);
                }
                console.log();

                c++;
            }

            c = 1;
            i++;
        }

        // Length of a test case
        const score = runs.reduce((acc, testResults, ci) => {
            return acc + testResults.reduce((sum, result) => sum + result.score, 0);;
        }, 0);

        const total = (score / runs.length) / runs[0].length;

        console.log("======= Summary =======");
        if (total >= this.validationRequirement) {
            console.log(`Test case: "${this.identifier}" *passed* with an average score of ${total} / 100`);
        } else {
            console.error(`Test case: "${this.identifier}" *failed* with a total score of ${total} / 100`);
        }
    }
}
