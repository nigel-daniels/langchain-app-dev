import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ConversationChain } from 'langchain/chains';
import { BufferMemory, BufferWindowMemory, ConversationSummaryMemory } from 'langchain/memory';

let llm = new ChatOpenAI({temperature: 0.0});
/*
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
*/

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

// Token Memeory is not implemented in JS

//
