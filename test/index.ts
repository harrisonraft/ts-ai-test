import { OpenAI } from "openai"
import { createSimplePromptFactory } from "../src/PromptFactories/CreateSimplePromptFactory";
import { SimpleTestCase } from "../src/SimpleTestCase/SimpleTestCase";
import { getPedagogicalModelString, InitialModelInput } from "./getPedagogicalModelString";
import { SimpleScoringValidator } from "../src/Validators/SimpleScoringValidator";
import { LLMValidator } from "../src/Validators/LLMValidator";

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

const pedagogicalModelClassificationPromptFactory = createSimplePromptFactory<InitialModelInput, ExpectedOutputType>(
    getPedagogicalModelString, // turns input into { user: "", system?: "" }
    [CommonJsonMapper<ExpectedOutputType>, MapToArray] as any // mapper which turns Prompt string output (could be LLM output too) into relevant ExpectedOutput. If this fails, testCase will pick it up
);

// PromptSet takes Prompt which is generic, works for all, a ComplexPromptFactory just wraps the Prompt and gives is all the stuff needed to work
const classificationPrompts = [
    pedagogicalModelClassificationPromptFactory(
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
    pedagogicalModelClassificationPromptFactory(
        { title: "Reflection only workbook",
            description: "Reflection only",
            subject: "Reflections",
            learners: "Any student",
            learningOutcomes: "Reflection on learning"
        },
        [PossibleExampleKeys.Reflection] as any
    ),
];

const pedagogicalModelTest = new SimpleTestCase({
    identifier: "Selection of pedagogical models",
    prompts: classificationPrompts,
    executor: ({ system, user }) => {
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
    validator: new SimpleScoringValidator(),
    validationRequirement: 75,
    runs: 3
});

// pedagogicalModelTest.run();

type fakeOutput = {
    hello: string;
    goodbye: string;
}

const fakeLLMObjectOutputPromptFactory = createSimplePromptFactory<null, fakeOutput>(
    () => ({ system: `Please return a json object, regardless of user input, that looks like this: { hello: "world", goodbye: "my friend" }`, user: "Hi..." }),
    [CommonJsonMapper<fakeOutput>]
)

const LLMValidationExecutor = (llmOutput: fakeOutput, realOutput: fakeOutput) => {
    return client.responses.create({
        model: "gpt-4.1",
        max_output_tokens: 500,
        text: {
            format: {type: "json_object"}
        },
        input: [
            {
                "role": "system",
                "content": [
                    {
                        "type": "input_text",
                        "text": `Your purpose is to evaluate the output of an AI versus the expected output the consumer requires.
                        This is being done to test the AI system, which is likely in use within a SaaS platform, and to understand how often it generates output that is expected.
                        You will be provided an input object as the user message, and you must evaluate it against the following EXPECTED output:
                        \r\n
                        \`\`\`json
                        ${JSON.stringify(realOutput)}
                        \`\`\`
                        \r\n
                        
                        Your return value must be a json object that has only a 'score' property as follows:
                        \`\`\`json
                        {
                            score: number, 0-100 representing the degree to which the data you have received is similar to the expected data,
                        }
                        \`\`\`
                        
                        Your judgement should be based on similarity, this doesn't mean that the output must be EXACTLY the same, but that it should be similar in structure + content. If there are small differences, this is acceptable - no one can predict the outcome of an LLM.
                        The user receiving these scores wants to understands how their AI system performs against a number of common test cases, to aid in tuning + testing of changes. Respond appropriately.
                        `
                    }
                ]
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": JSON.stringify(llmOutput)
                    }
                ]
            }
        ],
    }).then((response) => {
        return JSON.parse(response.output_text);
    });
}

const testingTheLLMCase = new SimpleTestCase({
    identifier: "Testing the LLM case",
    validator: new LLMValidator<fakeOutput>(LLMValidationExecutor),
    prompts: [fakeLLMObjectOutputPromptFactory(null, { hello: "world", goodbye: "hello" })],
    runs: 3,
    validationRequirement: 80,
    executor: ({ system, user }) => {
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
        }).then((r) => r.choices[0].message.content as string)
    }
})

testingTheLLMCase.run();
