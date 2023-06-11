import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain, SequentialChain } from 'langchain/chains';

// Note: here we use a higher temp for more creativity
let llm = new ChatOpenAI({temperature: 0.9});

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

let sequentialChain = new SequentialChain({
    chains: [llmChain4, llmChain5, llmChain6, llmChain7],
    inputVariables: ['review'],
    outputVariables:['english_review', 'summary', 'followup_message'],
    verbose: true
});

let review1 = {review: 'Je trouve le goût médiocre. La mousse ne tient pas, c\'est bizarre. J\'achète les mêmes dans le commerce et le goût est bien meilleur... Vieux lot ou contrefaçon !?'};
let response3 = await sequentialChain.call(review1);
console.log(response3);
