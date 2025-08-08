import { LLMPrompt } from "../../PromptFactories/types/LLMPrompt";
import { Mapper } from "../../Mappers/types/Mapper";

export interface IPrompt<TExpectedOutput> {
    prompt: LLMPrompt;
    expectedOutput: TExpectedOutput;
    mappers: [Mapper<any, any>, ...Mapper<any, any>[]];
    mapToExpectedOutput(input: string): TExpectedOutput
}
