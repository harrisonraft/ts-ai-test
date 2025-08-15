import { IPrompt } from "../../Prompt/interfaces/IPrompt";
import { PromptExecutor } from "../../types/PromptExecutor";
import { IValidator } from "../../Validators/interfaces/IValidator";

export type SimpleTestCaseConfig<T> = {
    identifier: string;
    prompts: Array<IPrompt<T>>;
    executor: PromptExecutor;
    validator: IValidator<T>
    runs?: number;
    validationRequirement?: number;
}
