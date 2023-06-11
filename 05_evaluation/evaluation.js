import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { StructuredOutputParser } from "langchain/output_parsers";
import { LLMChain, RetrievalQAChain } from 'langchain/chains';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { CSVLoader } from 'langchain/document_loaders/fs/csv';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import fs from 'fs';

// Let's set up the end points we need
let llm = new ChatOpenAI({temperature: 0.0});
// Use this version of fhe llm later (see below)
//let llm = new ChatOpenAI({temperature: 0.0, verbose: true});

let embedding = new OpenAIEmbeddings();

// Now let's set up a data source
let loader = new CSVLoader('OutdoorClothingCatalog_1000.csv');
let docs = await loader.load();

// Now let's create a node in memory vector store
let vectorStore = await HNSWLib.fromDocuments(docs, embedding);

// Looks like we cannot specify a doc separator in JS
let retrevalChain = RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever());


// Manual Test Generation
// We identfy some data points we think are good examples of the data set
// Then based on those items we set some ground truth questions
// Let's select these two documents

console.log(docs[10]);
console.log(docs[11]);

// Based on these we can build some hard coded QA sets
let examples = [
    {
        query: 'Do the Cozy Comfort Pullover Set have side pockets?',
        answer: 'Yes'
    },
    {
        query: 'What collection is the Ultra-Lofty 850 Stretch Down Hooded Jacket from?',
        answer: 'The DownTek collection'
    }
];

// Automated Test Genration
// At this time there is no JS equivalent of the QAGenerateChain
// to automatically generate evaluation question from the data set.
// Although we can use a custom prompt and structured output to fullfil the task.

let template1 = 'You are a test engineer coming up with query based tests.\n ' +
	'Given the following document, found between the begin and end document ' +
	'tags, please generate a query and answer based on that document.\n' +
	'Respond only using the following format instructions:\n\n' +
	'{format_instructions}\n\n' +
	'These questions should be detailed and be based explicitly on ' +
	'information in the document.\n\n' +
	'<Begin Document>\n' +
	'{doc}\n' +
	'<End Document>';

// Lets set the structure for the output to be what we did by hand before
let parser1 = StructuredOutputParser.fromNamesAndDescriptions({
	  query: "the question you have set",
	  answer: "answer to the question",
	});
let format1 = parser1.getFormatInstructions();

// Now we can combine these to get our prompt template
let promptTemplate1 = new PromptTemplate({
	template: template1,
	inputVariables: ['doc'],
	partialVariables: {
		format_instructions: format1
	}});

// Now we have our Javascript QAGenerateChain
let jsQAGenerateChain = new LLMChain({llm: llm, prompt: promptTemplate1});

// We can now loop thru the first 5 docs in our doc set and automatically
// generate test cases using the LLM
for (let i = 0; i < 5; i++) {
	let result = await jsQAGenerateChain.call({doc: docs[i].pageContent});
	let parsed = await parser1.parse(result.text);
	examples.push(parsed);
}

// We can now use this list of QA items to test the data set
let testResult = await retrevalChain.call({ query: examples[0].query });
console.log(testResult);



// DEBUG
// The equivalent of setting langchain.debug = True in python is to use
// verbose = true on the OpenAI class or ChatOpenAI
// switch the llm above to the one with verbose: true as an option and
// we can reun our test and see greater information
/*
let testResult = await retrevalChain.call({ query: examples[1].query });
console.log(testResult);
*/
// Running this with verbose: true lets us see a lot more information
// It can be especially useful to check the context and check the
// token cost of our query
// We can revert to the non debug llm to continue!


// Automated evaluation
// Again JS does not have it's own QAEvalChain but we can build one using an
// LLM chain as we did before

let predictions = await retrevalChain.apply(examples);

// Now let's build our own evaluator
let template2 = 'You are evaluating the results of a student Q&A session.\n ' +
	'You will be provided with the question, the student answer and the expected answer ' +
	'between the tags <Question>, <Answer> and <Expected> found below.\n\n' +
	'Respond using the following format instructions, include the ' +
	'question, answer, expected answer as well as the result:\n\n' +
	'{format_instructions}\n\n' +
	'You must evaluate how well the student answer matches the expected answer to ' +
	'decide if the question was a PASS or FAIL.\n' +
	'Assess the question ONLY on factual accuracy. Ignore differences in ' +
	'spelling punctuation or phrasing between their answer and the expected answer.\n' +
	'Here are the items to evaluate:\n\n' +
	'<Question>{question}</Question>\n' +
	'<Answer>{answer}</Answer>\n' +
	'<Expected>{expected}</Expected>';

// Lets set the structure for the output to be what we did by hand before
let parser2 = StructuredOutputParser.fromNamesAndDescriptions({
	  question: "the question that was asked",
	  answer: "answer the student gave",
	  expected: "the answer the student was expected to give",
	  result: "PASS or FAIL depending on how well the answer matched the expected answer"
	});
let format2 = parser2.getFormatInstructions();

// Now we can combine these to get our prompt template
let promptTemplate2 = new PromptTemplate({
	template: template2,
	inputVariables: ['question', 'answer', 'expected'],
	partialVariables: {
		format_instructions: format2
	}});

// Now we have our Javascript QAEvalChain
let jsQAEvalChain = new LLMChain({llm: llm, prompt: promptTemplate2});

// Let's loop thru the tests and see how the LLM did
for (let i = 0 ; i < examples.length; i++) {

	let result = await jsQAEvalChain.call({
		question: examples[i].query,
		answer: predictions[i].text,
		expected: examples[i].answer
	});

	let parsed = await parser2.parse(result.text);
	console.log(parsed);
}

// A much more user firendly version of this is to use the LangChainPlus
