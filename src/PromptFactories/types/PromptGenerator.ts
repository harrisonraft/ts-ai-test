import { LLMPrompt } from "./LLMPrompt";

export type PromptGenerator<TInput extends any> = (input: TInput) => LLMPrompt
