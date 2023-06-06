import { getCompletion } from './helper.js';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate, ChatPromptTemplate } from 'langchain/prompts';
import { HumanChatMessage } from 'langchain/schema';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

let chat = new ChatOpenAI({temperature: 0.0});

// Check the helper is working
let response = await getCompletion('What is 1+1?');
console.log(response);


// Here is an example of a possible use of an LLM
// This translates the 'pirate' message
let email = 'Arrr, I be fuming that me blender lid flew off ' +
    'and splattered me kitchen walls with smoothie! And to make matters ' +
    'worse,the warranty don\'t cover the cost of cleaning up me kitchen. ' +
    'I need yer help right now, matey!';

let style = 'American English in a calm and respectful tone';

let prompt1 = 'Translate the text that is delimited by triple backticks ' +
    'into a style that is ' + style + '. text: ```' + email + '```';

let response1 = await getCompletion(prompt1);
console.log(response1);



// Now we can replicate the above using langchain
let template = 'Translate the text that is delimited by triple ' +
    'backticks into a style that is {style}. text: ```{text}```';

let promptTemplate1 = PromptTemplate.fromTemplate(template);

let customerStyle = 'American English in a calm and respectful tone';

let customerEmail = 'Arrr, I be fuming that me blender lid flew off ' +
    'and splattered me kitchen walls with smoothie! And to make matters ' +
    'worse,the warranty don\'t cover the cost of cleaning up me kitchen. ' +
    'I need yer help right now, matey!';

let prompt2 =  await promptTemplate1.format({style: customerStyle, text: customerEmail});

let response2 = await chat.call([new HumanChatMessage(prompt2)]);
console.log(response2.text);


// We can now reuse this template to respond to the customer in their language
let serviceReply = 'Hey there customer, the warranty does not cover cleaning ' +
    'expenses for your kitchen because it\'s your fault that you misused ' +
    'your blender by forgetting to put the lid on before starting the blender. ' +
    'Tough luck! See ya!';

let pirateStyle = 'a polite tone that speaks in English Pirate';

let prompt3 =  await promptTemplate1.format({style: pirateStyle, text: serviceReply});

let response3 = await chat.call([new HumanChatMessage(prompt3)]);
console.log(response3.text);


// Output Parsers
// In this example we would like the output to form a JSON object format
// as exemplified by the object below:
//
// {
// "gift": False,
// "delivery_days": 5,
// "price_value": "pretty affordable!"
// }
let customerReview1 = 'This leaf blower is pretty amazing. It has four settings: ' +
    'candle blower, gentle breeze, windy city, and tornado. It arrived in two ' +
    'days, just in time for my wife\'s anniversary present. I think my wife ' +
    'liked it so much she was speechless. So far I\'ve been the only one using ' +
    'it, and I\'ve been using it every other morning to clear the leaves on ' +
    'our lawn. It\'s slightly more expensive than the other leaf blowers out ' +
    'there, but I think it\'s worth it for the extra features.';

let template2 = 'For the following text, extract the following information:\n\n' +
    'gift: Was the item purchased as a gift for someone else?\n' +
    'Answer True if yes, False if not or unknown.\n\n' +
    'delivery_days: How many days did it take for the product to arrive?\n' +
    'If this information is not found, output -1.\n\n' +
    'price_value: Extract any sentences about the value or price,and output ' +
    'them as a comma separated Python list.\n\n' +
    'Format the output as JSON with the following keys:\n' +
    'gift\n' +
    'delivery_days\n' +
    'price_value\n\n' +
    'text: {text}';

let promptTemplate2 = PromptTemplate.fromTemplate(template2);

let prompt4 =  await promptTemplate2.format({text: customerReview});

// What we get back here is just a String
let response4 = await chat.call([new HumanChatMessage(prompt4)]);
console.log(response4.text);


// Here we can yse this zod definition to take the response and
// structure it into a full JSON object
let zodSchema = z.object({
    gift: z.boolean().describe('Was the item purchased as a gift for someone else? Answer True if yes, False if not or unknown.'),
    delivery_days: z.number().describe('How many days did it take for the product to arrive? If this information is not found, output -1.'),
    price_value: z.array(z.string().describe('Extract any sentences about the value or price,and output them as a comma separated Python list.'))
});

let outputParser = StructuredOutputParser.fromZodSchema(zodSchema);

let formatInstructions = outputParser.getFormatInstructions();

let template3 = 'For the following text, extract the following information:\n\n' +
    'gift: Was the item purchased as a gift for someone else?\n' +
    'Answer True if yes, False if not or unknown.\n\n' +
    'delivery_days: How many days did it take for the product to arrive?\n' +
    'If this information is not found, output -1.\n\n' +
    'price_value: Extract any sentences about the value or price,and output ' +
    'them as a comma separated Python list.\n\n' +
    'text: {text}\n\n' +
    '{format_instrucions}';

let promptTemplate3 = PromptTemplate.fromTemplate(template3);

let prompt5 =  await promptTemplate3.format({text: customerReview, format_instrucions: formatInstructions});

let response5 = await chat.call([new HumanChatMessage(prompt5)]);

let outputJson = await outputParser.parse(response5.text);

console.log('gift         : ' + outputJson.gift);
console.log('delivery_days: ' + outputJson.delivery_days);
console.log('price_value  : ' + outputJson.price_value);
