import { OpenAI } from "openai/node"
import { myRealPromptClassificationCode } from "wherever";
import { SimpleTestCase, PromptSet, CreatePromptFactory, Prompt } from "ai-test"

type InitialModelInput = {
    title: string;
    description: string;
}

enum PossibleExampleKeys {
    Reflection = "Reflection",
    PersonalTutoringSupport = "PersonalTutoringSupport",
    EvidenceMapping = "EvidenceMapping"
}

type ExpectedOutputType = Array<PossibleExampleKeys>;

/**
 * So we have: some prompt scaffolding + need to inject data into said prompts. So specify:
 *  -- code to turn data into prompt
 *  -- data set
 *
 *  But we also need prompts to link to
 *
 *  a SimplePrompt handles mapping & validation
 *  a SimpleTestCase handles execution, logging, return of error %'s, etc -- takes a SimplePromptSet + Executor
 *
 *  a ComplexPrompt handles same as SimplePrompt, but allows us to 'decorate' with more complex validation (LLM in particular)
 *  a ChainedTestCase takes N of SimpleTestCase, and chains their output into the next input (also providing previous inputs)
 *      Validation happens at each step, and continues despite errors, (unless specified?) -- mapping failures always result in termination
 */

const CommonJsonMapper = <T>(resp: string): T => {
    return JSON.parse(resp) as T; // catch will happen elsewhere
}

const classificationPromptForPersonalTutoringWorkbook = CreatePromptFactory<InitialModelInput, ExpectedOutputType>(
    myRealPromptClassificationCode, // turns input into { user: "", system?: "" }
    [CommonJsonMapper<ExpectedOutputType>] // mapper which turns Prompt string output (could be LLM output too) into relevant ExpectedOutput. If this fails, testCase will pick it up
);

// PromptSet takes Prompt which is generic, works for all, a ComplexPromptFactory just wraps the Prompt and gives is all the stuff needed to work
const classificationPrompts = [
    classificationPromptForPersonalTutoringWorkbook(
        { title: "Personal Tutoring Workbook", description: "A workbook to..." },
        [PossibleExampleKeys.PersonalTutoringSupport]
    )
];

const testCase = new SimpleTestCase(
    classificationPrompts,
    ({ systemPrompt, userPrompt }) => {
        return OpenAI.createCompletion({
            maxTokens: 1000,
            system: systemPrompt,
            user: userPrompt,
            // ... whatever else
        });
    }
);

testCase.run(); // executes the PromptSet, logs results + keeps some "output" state in memory for future ref if needed

// TODO ^ implement above first, then do chained
