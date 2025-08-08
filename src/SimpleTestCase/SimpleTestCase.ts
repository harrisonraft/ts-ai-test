import { IPrompt } from "../Prompt/interfaces/IPrompt";
import { PromptExecutor } from "../types/PromptExecutor";

export class SimpleTestCase<TExpectedOutput> {
    private prompts: Array<IPrompt<TExpectedOutput>>;
    private executor: PromptExecutor;
    private abortSignal: AbortSignal;

    constructor(prompts: Array<IPrompt<TExpectedOutput>>, executor: PromptExecutor) {
        this.prompts = prompts;
        this.executor = executor;
        this.abortSignal = new AbortSignal();
    }

    public async run() {
        const promises = this.prompts.map((p) => {
            return this.executor(p.prompt).then((llmOutput) => {
                try {
                    p.mapToExpectedOutput(llmOutput);
                } catch (e) {
                    this.log(e);
                }


            }).catch((e) => {
                // error on API, immediately show and abort all
            })
        })
    }

    private validateOutput(prompt: IPrompt<TExpectedOutput>, output: TExpectedOutput) {
        // this be where da magic happens
        // If Array, validate that the items you declared exist, and no others; error appropriately (eg: 100%, or 70% (1 miss, 1 addition)
        // ... BUT. If array of OBJECTS, then recurse appropriately with below rule

        // if object, validate exact type match first then values

        // if string|number, just do ===

        // TODO
        //  ^ we will do the above in a validator, which consists of multiple classes based on type/style
        //  We'll have a resolver that takes your expected output, and returns the corresponding validator
        //  This will internally recurse through any nested objects/arrays and validate them accordingly
        //  We may have some requirement for configuration/strategy when it comes to the validators

    }

    private log(e: unknown) {
        console.error(`${e}`);
    }
}
