# LangChain for LLM Application Development
Test code for Building Systems with the ChatGPT API. This is based on the DeepLearning.AI, [LangChain for LLM Application Development](https://learn.deeplearning.ai/langchain/lesson/1/introduction) course. In this repository I have converted all of the examples from Python to JavaScript.
## Set Up
### API Key
If you want to try these out you will first need to setup your own ChatGPT secret key in your local environment. [Here](https://chatgpt.en.obiscr.com/blog/posts/2023/How-to-get-api-key/) is how you get a key. Once you have this put it in a local (server side) environment variable. For example in Mac OS, assuming you are using `zsh`, append the following to the file `.zshenv` in you own home directory:
```
export OPENAI_API_KEY='your_secret_key_value'
```
When you restart the shell or your machine the environment value `OPENAI_API_KEY` will be available to the `helper.js` and to langchain.

Also in this version of the tutorial you will need to get a Brave API key, you can sign up for those [here](https://brave.com/search/api/). This is needed in the agents lesson, they do ask for CC details even for the free API access and I signed up for the AI version of the subscription. This also needs to be exported in the same way you exported the OpenAI key, i.e.:
```
export BRAVE_SEARCH_API_KEY='your_secret_key_value'
```
### Node and JS
Before trying any of the exercises don't for get to run `npm install` in the `./langchain-app-dev` directory to install the Node modules needed.

In each subdirectory you will find a `*.js` file and, sometimes, some supporting files. Each JS file contains multiple prompts.
In most cases the initial exercise is ready to run and the other exercises are commented out using the `\* ... *\` comment markers. In these cases the commented code blocks will have their own calls to the LLM. If you uncomment these blocks then be sure to comment out the last to calls above while you run that exercise, it will reduce run time and costs.
