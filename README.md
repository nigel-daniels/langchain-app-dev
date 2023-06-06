# LangChain for LLM Application Development
Test code for Building Systems with the ChatGPT API. This is based on the DeepLearning.AI, [LangChain for LLM Application Development](https://learn.deeplearning.ai/langchain/lesson/1/introduction) course. In this repository I have converted all of the examples from Python to JavaScript.

## Set Up
### API Key
If you want to try these out you will first need to setup your own ChatGPT secret key in your local environment. [Here](https://chatgpt.en.obiscr.com/blog/posts/2023/How-to-get-api-key/) is how you get a key. Once you have this put it in a local (server side) environment variable. For example in Mac OS, assuming you are using `zsh`, append the following to the file `.zshenv` in you own home directory:
```
export OPENAI_API_KEY='your_secret_key_value'
```
When you restart the shell or your machine the environment value `OPENAI_API_KEY` will be available to the `helper.js`.

### Node and JS
Before trying any of the exercises don't for get to run `npm install` in the `./gptsystem` directory to install the Node modules needed.
In the root directory you will see the `helper.js`, all of the exercises use this to make their calls to the ChatGPT API.
In each subdirectory you will find a `*.js` file and, sometimes, some supporting text files. Each JS file contains multiple prompts. Generally there are a couple of lines near the end of the file, such as:
```
let completion = await getCompletion(prompt8);
console.log(completion);
```
In most cases you can just change the prompt passed to the `getCompletion()` function to try different exercises out. In some cases you will see code block commented out using the `\* ... *\` comment markers. In these cases the commented code blocks will have their own calls to `getCompletion()`, often in a loop of some kind. If you uncomment these blocks then be sure to comment out the last to calls above while you run that exercise.
