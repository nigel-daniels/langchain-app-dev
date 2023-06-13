// Import necessary modules from langchain.js library
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { RouterOutputParser } from 'langchain/output_parsers';
import { LLMChain, LLMRouterChain, MultiPromptChain } from 'langchain/chains';

// Set the llm to be factual
let llm2 = new ChatOpenAI({temperature: 0.0});

// Load the templates and build the prompt outlines
let templates = [
    {
        name: 'physics',
        description: 'Good for answering questions about physics',
        template: 'You are a very smart physics professor. You are great ' +
			'at answering questions about physics in a concise and easy to understand ' +
			'manner. When you don\'t know the answer to a question you admit that ' +
			'you don\'t know.\n\nHere is a question:\n{input}'
    },
    {
        name: 'math',
        description: 'Good for answering math questions',
        template: 'You are a very good mathematician. You are great at answering ' +
			'math questions. You are so good because you are able to break down hard ' +
			'problems into their component parts, answer the component parts, and ' +
			'then put them together to answer the broader question.\n\n' +
			'Here is a question:\n{input}'
    }
];


// Build an array of destination LLMChains and a list of the names with descriptions
let destinationChains = {};

for(const item of templates) {
    let prompt = PromptTemplate.fromTemplate(item.template);
    let chain = new LLMChain({llm: llm2, prompt: prompt});
    destinationChains[item.name] = chain;
}

let destinations = templates.map(item => (item.name + ': ' + item.description)).join('\n');

// Create a default destination in case the LLM cannot decide
let defaultPrompt = PromptTemplate.fromTemplate('{input}');

let defaultChain = new LLMChain({llm: llm2, prompt: defaultPrompt});

// Now set up the router and it's template
let routerTemplate = 'Given a raw text input to a ' +
	'language model select the model prompt best suited for the input. ' +
	'You will be given the names of the available prompts and a ' +
	'description of what the prompt is best suited for. ' +
	'You may also revise the original input if you think that revising ' +
	'it will ultimately lead to a better response from the language model.\n\n' +
	'<< FORMATTING >>\n' +
	'Return a markdown code snippet with a JSON object formatted to look like:\n' +
	'```json\n' +
	'{{\n' +
	'    "destination": string, // name of the prompt to use or "DEFAULT"\n' +
	'    "next_inputs": string // a potentially modified version of the original input\n' +
	'}}\n' +
	'```\n\n' +
	'REMEMBER: "destination" MUST be one of the candidate prompt ' +
	'names specified below OR it can be "DEFAULT" if the input is not ' +
	'well suited for any of the candidate prompts. ' +
	'REMEMBER: "next_inputs" can just be the original input ' +
	'if you don\'t think any modifications are needed.\n\n' +
	'<< CANDIDATE PROMPTS >>\n' +
	'{destinations}\n\n' +
	'<< INPUT >>\n' +
	'{input}\n\n' +
	'<< OUTPUT (remember to include the ```json)>>';

// Now we can construct the router with the list of route names and descriptions
routerTemplate = routerTemplate.replace('{destinations}', destinations);
let routerParser = new RouterOutputParser();
let routerFormat = routerParser.getFormatInstructions();

console.log(routerFormat);

let routerPrompt = new PromptTemplate({
	template: routerTemplate,
    inputVariables: ['input'],
    outputParser: routerParser,
    partialVariables: {
        format_instructions: routerFormat
    }
});
//console.log('#####\n' + JSON.stringify(routerPrompt) + '\n######');
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
