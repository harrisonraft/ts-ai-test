import { IPrompt } from "./interfaces/IPrompt";
import { LLMPrompt } from "../PromptFactories/types/LLMPrompt";
import { Mapper } from "../Mappers/types/Mapper";

/*
 * TODO..
 *  A TestCase will consume these via a set
 *  They should be instantiable with the prompt + and expected output
 *  when a testCase calls it, it will need to:
 *      - Grab the prompt
 *      - Call the LLM (exec defined later)
 *      - Run the output through the mappers
 *      - Validate against expected output
 *      - Log results
 */

export class Prompt<TExpectedOutput> implements IPrompt<TExpectedOutput> {
    public prompt: LLMPrompt;
    public expectedOutput: TExpectedOutput;
    public mappers: [Mapper<any, any>, ...Mapper<any, any>[]];

    constructor(prompt: LLMPrompt, expectedOutput: TExpectedOutput, mappers: [Mapper<any, any>, ...Mapper<any, any>[]]) {
        this.prompt = prompt;
        this.expectedOutput = expectedOutput;
        this.mappers = mappers;
    }

    public mapToExpectedOutput(llmOutput: string): TExpectedOutput {
        let result: TExpectedOutput;
        let i: number = 0;

        for (const m of this.mappers) {
            try {
                // @ts-ignore-next-line
                if (result === undefined) {
                    result = m(llmOutput);
                } else {
                    result = m(result);
                }
            } catch(e) {
                throw new Error(`Mapper #${i+1} for user prompt: ${this.prompt.user} has errored: ${e}`)
            }

            i++;
        }

        return result!;
    }
}
