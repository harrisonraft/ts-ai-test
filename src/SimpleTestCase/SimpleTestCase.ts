import { IPrompt } from "../Prompt/interfaces/IPrompt";
import { PromptExecutor } from "../types/PromptExecutor";
import { SimpleScoringValidator } from "../Validators/SimpleScoringValidator";
import { ValidatorResult } from "../Validators/types/ValidatorResult";
import { IValidator } from "../Validators/interfaces/IValidator";
import { SimpleTestCaseConfig } from "./types/SimpleTestCaseConfig";

type Result<TExpectedOutput> = {
    prompt: IPrompt<TExpectedOutput>,
    llmOutput: string,
    mappedOutput?: TExpectedOutput
} & ValidatorResult;

export class SimpleTestCase<TExpectedOutput> {
    private config: Required<SimpleTestCaseConfig<TExpectedOutput>>;

    constructor(
        config: SimpleTestCaseConfig<TExpectedOutput>
    ) {
        this.config = {
            ...config,
            runs: config.runs || 3,
            validationRequirement: config.validationRequirement || 100
        }
    }

    public async run(): Promise<void> {
        const runs: Array<Promise<Array<Result<TExpectedOutput>>>> = [];

        for (let i = 0; i < this.config.runs; i++) {
            runs.push(Promise.all(this.config.prompts.map((p, i) => {
                return this.config.executor(p.prompt).then(async(llmOutput) => {
                    const mappedOutput = p.mapToExpectedOutput(llmOutput);
                    const validation = await this.config.validator.validate(mappedOutput, p.expectedOutput, this.config.validationRequirement);

                    return {
                        prompt: p,
                        llmOutput: llmOutput,
                        mappedOutput: mappedOutput,
                        ...validation
                    };
                }).catch((e) => {
                    console.error(e);
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

    // TODO - pull out
    private logRuns(runs: Array<Array<Result<TExpectedOutput>>>) {
        let i = 1;
        let c = 1;

        console.log(JSON.stringify(runs[0][0].score));

        console.log(`=======================${"=".repeat(this.config.identifier.length)}`);
        console.log(`Results for Test Case: ${this.config.identifier}`);
        console.log(`=======================${"=".repeat(this.config.identifier.length)}`);
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
        if (total >= this.config.validationRequirement) {
            console.log(`Test case: "${this.config.identifier}" *passed* with an average score of ${total} / 100`);
        } else {
            console.error(`Test case: "${this.config.identifier}" *failed* with a total score of ${total} / 100`);
        }
    }
}
