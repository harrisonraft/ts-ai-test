import { LLMPrompt } from "../PromptFactories/types/LLMPrompt";

export type PromptExecutor = (prompt: LLMPrompt) => Promise<string>;
