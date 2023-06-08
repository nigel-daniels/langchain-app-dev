import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChatPromptTemplate, HumanMessagePromptTemplate, PromptTemplate } from 'langchain/prompts';
import { LLMChain, SimpleSequentialChain, SequentialChain } from 'langchain/chains';
import { MultiPromptChain } from 'langchain/chains/router';
import { LLMRouterChain, RouterOutputParser } from 'langchain/chains/router/llm_router';
import fs from 'fs';

// Note: here we use a higher temp for more creativity
let llm1 = new ChatOpenAI({temperature: 0.9});

// LLMChain
// A basic chain of conversation
/*
let template1 = 'What is the best name to describe a company that makes {product}?';

let promptTemplate1 = ChatPromptTemplate.fromPromptMessages([
    HumanMessagePromptTemplate.fromTemplate(template1)
]);

let llmChain1 = new LLMChain({llm: llm1, prompt: promptTemplate1});

let product1 = 'Queen Size Sheet Set';

let response1 = await llmChain.call({product: product1});
console.log(response1.text);
*/
// Sequential chains
// This type of chain tat combines multiple chains where the output of one chain
// is the input for the next chain.
// There are two types of sequential chain:
//    1. SimpleSequentialChain: Single input/output
//    2. SequentialChain: multiple inputs/outputs

// SimpleSequentialChain
/*
let template2 = 'What is the best name to describe a company that makes {product}?';
let promptTemplate2 = ChatPromptTemplate.fromPromptMessages([
    HumanMessagePromptTemplate.fromTemplate(template2)
]);
let llmChain2 = new LLMChain({llm: llm1, prompt: promptTemplate2});


let template3 = 'Write a 20 words description for the following company:{company_name}';
let promptTemplate3 = ChatPromptTemplate.fromPromptMessages([
    HumanMessagePromptTemplate.fromTemplate(template3)
]);
let llmChain3 = new LLMChain({llm: llm1, prompt: promptTemplate3});

let simpleSequentialChain = new SimpleSequentialChain({chains: [llmChain2, llmChain3], verbose: true});

let product2 = 'Queen Size Sheet Set';

let response2 = await simpleSequentialChain.run(product2);
console.log(response2);
*/

// SequentialChain
/*
let template4 = 'Translate the following review to english:\n\n{review}';
let promptTemplate4 = ChatPromptTemplate.fromPromptMessages([
    HumanMessagePromptTemplate.fromTemplate(template4)
]);
let llmChain4 = new LLMChain({llm: llm1, prompt: promptTemplate4, outputKey: 'english_review'});

let template5 = 'Can you summarize the following review in 1 sentence:\n\n{english_review}';
let promptTemplate5 = ChatPromptTemplate.fromPromptMessages([
    HumanMessagePromptTemplate.fromTemplate(template5)
]);
let llmChain5 = new LLMChain({llm: llm1, prompt: promptTemplate5, outputKey: 'summary'});

let template6 = 'What language is the following review:\n\n{review}';
let promptTemplate6 = ChatPromptTemplate.fromPromptMessages([
    HumanMessagePromptTemplate.fromTemplate(template6)
]);
let llmChain6 = new LLMChain({llm: llm1, prompt: promptTemplate6, outputKey: 'language'});

let template7 = 'Write a follow up response to the following summary in the ' +
    'specified language:\n\nSummary: {summary}\n\nLanguage: {language}';
let promptTemplate7 = ChatPromptTemplate.fromPromptMessages([
    HumanMessagePromptTemplate.fromTemplate(template7)
]);
let llmChain7 = new LLMChain({llm: llm1, prompt: promptTemplate7, outputKey: 'followup_message'});

let sequentialChain = new SequentialChain({
    chains: [llmChain4, llmChain5, llmChain6, llmChain7],
    inputVariables: ['review'],
    outputVariables:['english_review', 'summary', 'language', 'followup_message'],
    verbose: true
});


//let review1 = data.loc({rows: [5], columns: ['Review']}).values[0][0];
let review1 = 'Je trouve le goût médiocre. La mousse ne tient pas, c\'est bizarre. J\'achète les mêmes dans le commerce et le goût est bien meilleur... Vieux lot ou contrefaçon !?';
let response3 = await sequentialChain(review1);
console.log(response3);
*/

// RouterChain
// This chain can make decision on which subsiquent chain to call based on
// the input given.
// here we need factual answers
let llm2 = new ChatOpenAI({temperature: 0.0});

let templatesFile = fs.readFileSync('./templates.json', 'utf8');
let templates = JSON.parse(templatesFile);

let prompts = [
    {
        name: 'physics',
        description: 'Good for answering questions about physics',
        template: templates.physics_template
    },
    {
        name: 'math',
        description: 'Good for answering math questions',
        template: templates.math_template
    },
    {
        name: 'History',
        description: 'Good for answering history questions',
        template: templates.history_template
    },
    {
        name: 'computer science',
        description: 'Good for answering computer science questions',
        template: templates.computerscience_template
    }
];

let destinationChains = {};
let destinations = [];

for(const item in prompts) {
    let chatPrompt = ChatPromptTemplate.fromPromptMessages([
        HumanMessagePromptTemplate.fromTemplate(item.template)
    ]);

    let chain = LLMChain({llm: llm2, prompt: chatPrompt});

    destinationChains[item.name] = chain;

    destinations.push({item.name: item.description});
}

let destinationText = '\n' + destinations;
