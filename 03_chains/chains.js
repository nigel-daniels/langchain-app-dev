import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChatPromptTemplate, HumanMessagePromptTemplate, PromptTemplate } from 'langchain/prompts';
import { RouterOutputParser } from 'langchain/output_parsers';
import { LLMChain, SimpleSequentialChain, SequentialChain, LLMRouterChain, MultiPromptChain } from 'langchain/chains';
import { z } from 'zod';
import fs from 'fs';

// Note: here we use a higher temp for more creativity
let llm1 = new ChatOpenAI({temperature: 0.9});

// LLMChain
// A basic chain of conversation

let template1 = 'What is the best name to describe a company that makes {product}?';

let promptTemplate1 = ChatPromptTemplate.fromPromptMessages([
    HumanMessagePromptTemplate.fromTemplate(template1)
]);

let llmChain1 = new LLMChain({llm: llm1, prompt: promptTemplate1});

let product1 = 'Queen Size Sheet Set';

let response1 = await llmChain.call({product: product1});
console.log(response1.text);


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
// Here we build up the prompts, note JS we use the basic PromptTemplate
let template4 = 'Translate the following review to english:\n\n{review}';
let promptTemplate4 = new PromptTemplate({template: template4, inputVariables: ['review']});
let llmChain4 = new LLMChain({llm: llm, prompt: promptTemplate4, outputKey: 'english_review'});

let template5 = 'Can you summarize the following review in 1 sentence:\n\n{english_review}';
let promptTemplate5 = new PromptTemplate({template: template5, inputVariables: ['english_review']});
let llmChain5 = new LLMChain({llm: llm, prompt: promptTemplate5, outputKey: 'summary'});

let template6 = 'What language is the following review:\n\n{review}';
let promptTemplate6 = new PromptTemplate({template: template6, inputVariables: ['review']});
let llmChain6 = new LLMChain({llm: llm, prompt: promptTemplate6, outputKey: 'language'});

let template7 = 'Write a follow up response to the following summary in the ' +
    'specified language:\n\nSummary: {summary}\n\nLanguage: {language}';
let promptTemplate7 = new PromptTemplate({template: template7, inputVariables: ['summary', 'language']});
let llmChain7 = new LLMChain({llm: llm, prompt: promptTemplate7, outputKey: 'followup_message'});

// Now we can build up the sequence in a chain, note that the output and input
// names MUST match, also that the 'summary' from llmChain5 only get's used later
// we can also see the initial review is used at the beginning and in llmChain6
let sequentialChain = new SequentialChain({
    chains: [llmChain4, llmChain5, llmChain6, llmChain7],
    inputVariables: ['review'],
    outputVariables:['english_review', 'summary', 'followup_message'],
    verbose: true
});

// Now we can run our sequence
let review1 = {review: 'Je trouve le goût médiocre. La mousse ne tient pas, c\'est bizarre. J\'achète les mêmes dans le commerce et le goût est bien meilleur... Vieux lot ou contrefaçon !?'};
let response3 = await sequentialChain.call(review1);
console.log(response3);
*/

// RouterChain
// This chain can make decision on which subsiquent chain to call based on
// the input given.
// NOTE There is still a bug in this getting the RouterOutputParser to work
//      Its not clear if there is an issue with the router parser or how
//      I'm attempting to use it! See routerTest.js
/*
// here we need factual answers
let llm2 = new ChatOpenAI({temperature: 0.0});

// Load the templates and build the prompt outlines
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
        name: 'history',
        description: 'Good for answering history questions',
        template: templates.history_template
    },
    {
        name: 'computer science',
        description: 'Good for answering computer science questions',
        template: templates.computerscience_template
    }
];


// Build an array of destination LLMChains and a list of the names with descriptions
let destinationChains = {};

for(const item of prompts) {
    let prompt = PromptTemplate.fromTemplate(item.template);

    let chain = new LLMChain({llm: llm2, prompt: prompt});

    destinationChains[item.name] = chain;
}

let destinations = prompts.map(item => (item.name + ': ' + item.description)).join('\n');


// Create a default destination in case the LLM cannot decide
let defaultPrompt = PromptTemplate.fromTemplate('{input}');

let defaultChain = new LLMChain({llm: llm2, prompt: defaultPrompt});

// Load the routing prompt, NOTE this differs a lot from the one in the course example
// as the system kept inventing 'biology' as a destination or selected 'physics'
// instead of using the correct 'DEFAULT'
let routerTemplate = fs.readFileSync('./router_template.txt', 'utf8');

// Now we can construct the router with the list of route names and descriptions
routerTemplate = routerTemplate.replace('{destinations}', destinations);

// Now we have to make a Zod schema to set up the output parser
let routerParser = RouterOutputParser.fromZodSchema(z.object({
    destination: z.string().describe('name of the prompt to use or "DEFAULT"'),
    next_inputs: z.object({
		input: z.string().describe('a potentially modified version of the original input')
	})
}));

let routerFormat = routerParser.getFormatInstructions();

// Using the template and the parser we can now build the prompt for routing
// and construct the initial routing chain
let routerPrompt = new PromptTemplate({
	template: routerTemplate,
    inputVariables: ['input'],
    outputParser: routerParser,
	partialVariables: {
        format_instructions: routerFormat
    }
});

let routerChain = LLMRouterChain.fromLLM(llm2, routerPrompt);


// Now we can bring all of the pieces together!
let multiPromptChain = new MultiPromptChain({
	routerChain,
    destinationChains,
    defaultChain,
	verbose: true
});

let response4 = await multiPromptChain.run('What is black body radiation?');
console.log(response4.text);

let response5 = await multiPromptChain.run('What is 2 + 2?');
console.log(response5.text);

let response6 = await multiPromptChain.run('Why does every cell in our body contain DNA?');
console.log(response6.text);
*/
