import { OpenAI } from "openai"
import { createSimplePromptFactory } from "../src/PromptFactories/CreateSimplePromptFactory";
import { SimpleTestCase } from "../src/SimpleTestCase/SimpleTestCase";
import { getPedagogicalModelString, InitialModelInput } from "./getPedagogicalModelString";

const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPEN_AI_KEY || "",
});


enum PossibleExampleKeys {
    Reflection = "Reflection",
    PersonalTutoringSupport = "PersonalTutoringSupport",
    EvidenceMapping = "EvidenceMapping"
}

type ExpectedOutputType = { models: Array<PossibleExampleKeys> };

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
    console.log("response is:", resp);
    return JSON.parse(resp) as T; // catch will happen elsewhere
}

const MapToArray = (resp: { models: Array<PossibleExampleKeys> }): Array<PossibleExampleKeys> => {
    return resp.models;
}

// TODO - mapped types aint mapping for the mappers to map the models

const classificationPromptForPersonalTutoringWorkbook = createSimplePromptFactory<InitialModelInput, ExpectedOutputType>(
    getPedagogicalModelString, // turns input into { user: "", system?: "" }
    [CommonJsonMapper<ExpectedOutputType>, MapToArray] as any // mapper which turns Prompt string output (could be LLM output too) into relevant ExpectedOutput. If this fails, testCase will pick it up
);

// PromptSet takes Prompt which is generic, works for all, a ComplexPromptFactory just wraps the Prompt and gives is all the stuff needed to work
const classificationPrompts = [
    classificationPromptForPersonalTutoringWorkbook(
        { title: "Personal Tutoring Workbook",
            description: "A workbook that provides first year students with the ability to reflect on and track their 3 personal tutoring sessions. Should also include somewhere to provide feedback & reflect on current (pre meeting) abilities relating to higher education soft skills, and end-of-year abilities (so we know who to target for tutoring in 2nd year)",
            subject: "All subject will use this workbook",
            learners: "First years",
            learningOutcomes: "Reflection on tutoring sessions\n" +
                "Start and end self assessment of skills\n" +
                "Feedback to the tutor\n"
        },
        [PossibleExampleKeys.PersonalTutoringSupport] as any
    ),
    classificationPromptForPersonalTutoringWorkbook(
        { title: "Reflection only workbook",
            description: "Reflection only",
            subject: "Reflections",
            learners: "Any student",
            learningOutcomes: "Reflection on learning"
        },
        [PossibleExampleKeys.Reflection] as any
    ),
];

const testCase = new SimpleTestCase(
    "Selection of pedagogical model",
    classificationPrompts,
    ({ system, user }) => {
        return client.chat.completions.create({
            max_completion_tokens: 1000,
            response_format: {
                type: "json_object"
            },
            model: "gpt-4.1-mini",
            messages: [
                {
                    role: "system",
                    content: system as string
                },
                {
                    role: "user",
                    content: user
                }
            ]
        }).then((r) => r.choices[0].message.content as string);
    },
    3,
    75
);

testCase.run();
