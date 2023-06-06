import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

// This is the basic call to an Open AI LLM.
// Yopu can just send in a string request and it returns the string response.
async function getCompletion( prompt, model = 'gpt-3.5-turbo', temperature = 0 ) {
    const messages = [{
        role: 'user',
        content: prompt
    }];

    const completion = await openai.createChatCompletion({
        model: model,
        messages: messages,
        temperature: temperature       // The degree of randomness in the output
    });

    return completion.data.choices[0].message.content;
};


// This function expects an array of messages, e.g.:
//
// let messages =  [
//      {'role':'system', 'content':'You are an assistant...'},
//      {'role':'user', 'content':'tell me a joke'},
//      {'role':'assistant', 'content':'Why did the chicken cross the road'},
//      {'role':'user', 'content':'I don\'t know'}
// ]
//
// Note the different role specifications:
//
//  system:     Sets the behaviour of the system for the ensuing conversation.
//              We could have said: 'You are an assistant that speaks like Shakespeare.'
//              The user never sees this but it set's the tone the system
//              uses in the conversation
//  assistant:  This is the chat models compleations.
//  user:       This is the enties the user makes
async function getCompletionFromMessages( messages, model = 'gpt-3.5-turbo', temperature = 0, maxTokens = 500 ) {
    const completion = await openai.createChatCompletion({
        model: model,
        messages: messages,
        temperature: temperature,       // The degree of randomness in the output
		max_tokens:	maxTokens			// the maximum number of tokens the model can output
    });

    return completion.data.choices[0].message.content;
};

// This function is the same as the previous function but it returns the tokens consumed
// The returned result is an object NOT just a string, the object looks like:
// {
// content: string,						A string containing the resulting completion text
// tokens : {  							An object holding token values
//			prompt_tokens: number,		Tokens sent in
//			completion_tokens: number,	Tokens returned
//			total_tokens: number,		Sum of the tokens used
//			}
// }
async function getCompletionAndTokenCount( messages, model = 'gpt-3.5-turbo', temperature = 0, maxTokens = 500 ) {
	let result = {};

	const completion = await openai.createChatCompletion({
        model: model,
        messages: messages,
        temperature: temperature,       // The degree of randomness in the output
		max_tokens:	maxTokens			// the maximum number of tokens the model can output
    });

	result.content = completion.data.choices[0].message.content;
	result.tokens = {
		prompt_tokens: completion.data.usage.prompt_tokens,
		completion_tokens: completion.data.usage.completion_tokens,
		total_tokens: completion.data.usage.total_tokens
	};

	return result;
};

// This function moderates input and allows for the detection of prompts
// outside of the openai usage policy
async function moderate( prompt ) {
	const completion = await openai.createModeration( {input: prompt} );

	return completion.data.results[0];
}

export { getCompletion, getCompletionFromMessages, getCompletionAndTokenCount, moderate };
