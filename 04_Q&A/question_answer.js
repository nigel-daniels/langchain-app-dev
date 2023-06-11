import { OpenAI } from 'langchain/llms/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { CSVLoader } from 'langchain/document_loaders/fs/csv';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { RetrievalQAChain } from 'langchain/chains';


let llm = new OpenAI({temperature: 0.0});
let embedding = new OpenAIEmbeddings();

// First we can use the document loader to load the information we will be searching
let loader = new CSVLoader('OutdoorClothingCatalog_1000.csv');
let docs = await loader.load();

// This step differs from the Python classes a bit, for node.js we can use the
// HNSWLib in memory vector store, we also don't need to use the indexer.
// Here we build the vector store by passing in the documents and we simply
// use an OpenAI embedding to allow us to query the data set [See Notes]
let vectorStore = await HNSWLib.fromDocuments(docs, embedding);


// Sending a general query prompt to the LLM with documents

// Again JS differs so instead of the VectorstoreIndexCreator we use
// The RetrievalQAChain and pass in the llm and convert the vector store
// into a retriever (q.v.)



// The Original Document Store

// we can review individual documents in the db
console.log(docs[0]);


// Example of Embedding
/*
// If we generate an embedding for a query we can look at the length and values created
let embed = await embedding.embedQuery('Hi my name is Nigel.');

console.log(embed.length);
console.log(embed.slice(0, 5));
*/

// Querying the Vector Store
/*
// Here we can use the vector store to retrieve similar docs
let query2 = 'Please suggest a shirt with sunblocking.';

// Javascript function has a different name to Python
let result2 = await vectorStore.similaritySearch(query2);
console.log(result2.length);
console.log(result2[0]);

// Sending Query results to an LLM
let compiledDocs = result2.reduce((collected, doc) => collected.concat('\n', doc.pageContent), '');

let query3 = ' Question: Please list all these shirts with sun protection in a table using markdown and summarize each one.'

let response1 = await llm.call(compiledDocs + query3);
console.log(response1);
*/

// Doing Q&A on our own docs
// This lets us recreate the previous example in a simpler way using a retriever
/*
// Create a retriever, a generic interface to return a subset of the documents
let retriever = vectorStore.asRetriever();

// Note the parameters differ from the Python version,
// it defaults to the stuff chain [See notes]
let retrevalChain = RetrievalQAChain.fromLLM(llm, retriever);

// Now we can construct the query and make a call to the LLM
let query3 = 'Please list all your shirts with sun protection in a table in markdown and summarize each one.';

let result3 = await retrevalChain.call({query: query1});

console.log(result3);
*/
