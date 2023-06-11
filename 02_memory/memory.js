import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ConversationChain } from 'langchain/chains';
import { BufferMemory, BufferWindowMemory, ConversationSummaryMemory } from 'langchain/memory';

let llm = new ChatOpenAI({temperature: 0.0});

// BufferMemory
// This memory allows for the storing of messages and then extracts
// the messages in a variable.
// Here is an example of having a conversation with the LLm

let memory1 = new BufferMemory();
let chain1 = new ConversationChain({llm: llm, memory: memory1});

let response1 = await chain1.predict({input: 'Hi, my name is Nigel'});
console.log(response1);
let response2 = await chain1.predict({input: 'What is 1+1?'});
console.log(response2);
let response3 = await chain1.predict({input: 'What is my name?'});
console.log(response3);

let conversation1 = await memory1.loadMemoryVariables();
console.log(conversation1);


// This just shows how we could pre-populate the memory
/*
let memory2 = new BufferMemory();

memory2.saveContext(
    {inputValues: 'Hi'},
    {outputValues: 'What\'s up?'}
);

let conversation2 = await memory2.loadMemoryVariables();
console.log(conversation2);

memory2.saveContext(
    {inputValues: 'Not much, just hanging'},
    {outputValues: 'Cool'}
);

let conversation3 = await memory2.loadMemoryVariables();
console.log(conversation3);
*/
// BufferWindowMemory
// This memory keeps a rolling list of the interaction of the conversation
// over time. It only uses the last K interactions
// It's important to note that LLMs are stateless, each transaction is indipendant
// Chatbots appear to have memeory as the entire conversation is provided as context
// The window memeory with k set to 1 demonstrates a memory with 'goldfish memeory'
// Its just recall one transaction, typically this would be a larger number
/*
let windowMemory = new BufferWindowMemory({k: 1});
let chain2 = new ConversationChain({llm: llm, memory: windowMemory});

windowMemory.saveContext(
    {inputValues: 'Hi'},
    {outputValues: 'What\'s up?'}
);
windowMemory.saveContext(
    {inputValues: 'Not much, just hanging'},
    {outputValues: 'Cool'}
);

let conversation4 = await windowMemory.loadMemoryVariables();
console.log(JSON.stringify(conversation4) + '\n');
/*
let response4 = await chain2.predict({input: 'Hi, my name is Nigel'});
console.log(response4);
let response5 = await chain2.predict({input: 'What is 1+1?'});
console.log(response5);
let response6 = await chain2.predict({input: 'What is my name?'});
console.log(response6);
*/

// TokenBufferMemeory is not implemented in JS
// This memory behaves like the window memeory but uses number of takes to
// define the interaction list size rather than a count of interactions.

// ConversationSummaryMemory
// This creates a summary of the conversation over time.
// The conversation summary memory summerises the summery of the conversation1
// the summary functions as the memory of the conversation.
/*
let scheduleText = 'There is a meeting at 8am with your product team. ' +
    'You will need your powerpoint presentation prepared. 9am-12pm have time ' +
    'to work on your LangChain project which will go quickly because ' +
    'Langchain is such a powerful tool. At Noon, lunch at the italian ' +
    'resturant with a customer who is driving from over an hour away to meet ' +
    'you to understand the latest in AI. Be sure to bring your laptop to ' +
    'show the latest LLM demo.';
// Note the JS version does nt use a token count and automatically summarizes the conversation
let summaryMemory = new ConversationSummaryMemory({llm: llm, memoryKey: 'history'});

await summaryMemory.saveContext(
    {inputValues: 'Hello'},
    {outputValues: 'What\'s up?'}
);
await summaryMemory.saveContext(
    {inputValues: 'Not much, just hanging'},
    {outputValues: 'Cool'}
);
await summaryMemory.saveContext(
    {inputValues: 'What is on the schedule today?'},
    {outputValues: scheduleText}
);

let conversation4 = await summaryMemory.loadMemoryVariables();
console.log('Initial summary: ' + conversation4 + '\n');

let chain3 = new ConversationChain({llm: llm, memory: summaryMemory, verbose: true});
//
let response7 = await chain3.predict({input: 'What would be a good demo to show?'});

let conversation5 = await summaryMemory.loadMemoryVariables();
console.log('\nFinal summary: ' + conversation5);
*/
// Other memeories available are:
// Vector data memory
// Stores text (from the conversation or elsewhere) in a vector database
// and retrieves the most relevant blocks of text.
//
// Entity memories
// Using an LLM it remembers details about specific memeories.
//
// You can use multiple memories at one time. e.g. Conversation Memory
// & entity memory to recall individualls.
//
// You can also store the conversation in a conventional database
// (such as a key-value store or SQL)
