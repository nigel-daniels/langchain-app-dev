import { ChatOpenAI } from 'langchain/chat_models/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { Calculator } from 'langchain/tools/calculator';
import { BraveSearch, DynamicTool } from 'langchain/tools';

// Let's set up the end points we need, we use 0
// as this is the agents reasoning capability
let llm = new ChatOpenAI({temperature: 0.0});

let tools = [
	new Calculator(), 	// Equivalent of llm-math
	new BraveSearch()	// In place of Wikipedia, Note: this requires an API KEY
];

// To use the Brave Search you need to get an API key from here https://brave.com/search/api/
// export this to your env under the name BRAVE_SEARCH_API_KEY

let agent = await initializeAgentExecutorWithOptions(
	tools,
	llm,
	{
		agentType: 'chat-zero-shot-react-description',	// An agent that uses chat models, react gets the best results
		verbose: true
	}
);

let mathResult = await agent.call({ input: 'What is the 25% of 300?' });
console.log(mathResult);

let question = 'Tom M. Mitchell is an American computer scientist ' +
	'and the Founders University Professor at Carnegie Mellon University (CMU) ' +
	'what book did he write?';

let searchResult = await agent.call({ input: question });
console.log(searchResult);


// Currently the JS API does not have a JS REPL tool available :-(


// We can create a custom tool
/*
let dateTool = new DynamicTool({
  name: 'date_tool',
  description: 'Returns todays date, use this for any questions related to ' +
  	'knowing todays date. The input should always be an empty string, and ' +
	'this function will always return todays date - any date mathmatics ' +
	'should occur outside this function.',
  func: input => new Date().toDateString(),
});

let dateAgent = await initializeAgentExecutorWithOptions(
	[ dateTool ],
	llm,
	{
		agentType: 'chat-zero-shot-react-description',	// An agent that uses chat models, react gets the best results
		verbose: true
	}
);

let date = await dateAgent.call({ input: 'whats the date today?' });
console.log(date);
*/
