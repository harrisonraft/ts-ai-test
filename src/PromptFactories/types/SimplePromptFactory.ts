import { Prompt } from "../../Prompt/Prompt";

export type SimplePromptFactory<TInput, TExpectedOutput> = (input: TInput, output: TExpectedOutput) => Prompt<TExpectedOutput>;
