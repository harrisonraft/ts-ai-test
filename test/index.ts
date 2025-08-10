import { OpenAI } from "openai"
import { createSimplePromptFactory } from "../src/PromptFactories/CreateSimplePromptFactory";
import { SimpleTestCase } from "../src/SimpleTestCase/SimpleTestCase";

const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPEN_AI_KEY || "",
});

type InitialModelInput = {
    title: string;
    description: string;
    subject: string;
    learners: string;
    learningOutcomes: string;
}

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

export enum AssessmentModels {
    Reflection = "Reflection",
    TimeKeepingAndLogging = "TimeKeepingAndLogging",
    PersonalDevelopmentPlanning = "PersonalDevelopmentPlanning",
    EvidenceMapping = "EvidenceMapping",
    WorkBasedAssessment = "WorkBasedAssessment",
    ActivityLogging = "ActivityLogging",
    ProjectWork = "ProjectWork",
    PersonalTutoringSupport = "PersonalTutoringSupport",
    ActionPlanning = "ActionPlanning"
}
export type AssessmentModelMaps = {
    [K in AssessmentModels]: {
        reason: string;
        templates: Array<any>;
        workbooks: Array<any>;
    };
};
export const assessmentModelMap: AssessmentModelMaps = {
    [AssessmentModels.Reflection]: {
        reason: "Giving the learner the opportunity to think about their experiences and what they have learnt ",
        templates: [],
        workbooks: []
    },
    [AssessmentModels.TimeKeepingAndLogging]: {
        reason: "Tracking learner's compliance with minimum targets of timed activity, within different periods (week, placement, year etc.)",
        templates: [],
        workbooks: []
    },
    [AssessmentModels.PersonalDevelopmentPlanning]: {
        reason: "Allowing the learner to develop their own plans to enhance and develop their knowledge, skills and experience (often supervised)",
        templates: [],
        workbooks: []
    },
    [AssessmentModels.EvidenceMapping]: {
        reason: "The option for a learner to manually or automatically associate files/assets to a framework of mappable capability fields",
        templates: [],
        workbooks: []
    },
    [AssessmentModels.WorkBasedAssessment]: {
        reason: "The requirement to capture and verify activities taking place within a real world environment, often within a placement under supervision",
        templates: [],
        workbooks: []
    },
    [AssessmentModels.ActivityLogging]: {
        reason: "This approach is used when a learner is required to evidence a minimum number threshold of activities",
        templates: [],
        workbooks: []
    },
    [AssessmentModels.ProjectWork]: {
        reason: "The delivery of a learner or assessor defined project, either as an individual or within a group, producing an output such as a report or presentation",
        templates: [],
        workbooks: []
    },
    [AssessmentModels.PersonalTutoringSupport]: {
        reason: "Providing an opportunity to manage the personal tutoring relationship often structured around a minimum number of 1-2-1 meetings throughout an academic year",
        templates: [],
        workbooks: []
    },
    [AssessmentModels.ActionPlanning]: {
        reason: "Asking the learner to create and monitor an action plan to address and identified development requirement",
        templates: [],
        workbooks: []
    }
};

export const getPedagogicalModelString = (model: InitialModelInput): { system: string; user: string } => {
    let modelString = "";

    for (const [key, value] of Object.entries(assessmentModelMap)) {
        modelString += `${key}: ${value.reason}\n`;
    }

    const user = `
        The user has provided us with the following information of what they want to build. 
    
        What would you like to call the workbook?
        "${model.title}"
        
        What would you like to build, in as much detail as possible?
        "${model.description}"
        
        What is the subject or discipline?
        "${model.subject}"
        
        Who are your learners?
        "${model.learners}"
        
        What are the main learning outcomes or objectives for this activity?
        "${model.learningOutcomes}"
    `;

    const system = `
        You are an AI agent dedicated to the creation of meaningful Workbooks within the PebblePad platform.
    
        PebblePad is a flexible ePortfolio, workbook, and assessment platform used to design interactive learning experiences. 
        It enables learning designers and course administrators to create Workbooks, which are structured collections of Templates that learners complete and submit for assessment or reflection.
        
        ## Your Task
        Choose up to 3 of the following example assessment model types that best fit the users requirement.
        
        ${modelString}
         
        It is perfectly reasonable to not choose any example if there are no good matches.
 
        Please respond with a JSON array which is either empty or has the string names of the examples, eg: ["Reflection"]
               
        The returned JSON always be in this format

        { models: ["array of string models"] }
    `;

    return {
        system: system,
        user: user
    };
};


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
