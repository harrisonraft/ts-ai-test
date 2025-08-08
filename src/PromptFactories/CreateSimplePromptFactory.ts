import { SimplePromptFactory } from "./types/SimplePromptFactory";
import { Prompt } from "../Prompt/Prompt";
import { PromptGenerator } from "./types/PromptGenerator";
import { StringChainedMappers } from "./types/StringChainedMappers";
import { Mapper } from "../Mappers/types/Mapper";

export const createSimplePromptFactory = <TInput, TExpectedOutput, TMapperChain extends [Mapper<any, any>, ...Mapper<any, any>[]]>
    (generator: PromptGenerator<TInput>, mappers: StringChainedMappers<TMapperChain>): SimplePromptFactory<TInput, TExpectedOutput> => {
    return (input: TInput, expectedOutput: TExpectedOutput) => {
        return new Prompt(generator(input), expectedOutput, mappers)
    }
}
