const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;

const { Configuration, OpenAIApi } = require("openai");

const config = new Configuration({
  apiKey: "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",
});

const openai = new OpenAIApi(config);

const runPrompt = async (prompt) => {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.log("Failed to generate completion");
    console.log("Error-runprompt", error.message);
  }
};

app.use(express.static(__dirname));
app.use(bodyParser.json()); // Parse JSON request bodies

app.post("/processQuestion", async (req, res) => {
  // Extract the question from the request body
  const question = req.body.question;
  // console.log(question);

  try {
    // Call the OpenAI API using async/await and await the response
    const response = await runPrompt(question);
    // console.log(response);
    // res.send({ response });
    res.json({ response });
  } catch (error) {
    console.error("Error:-post", error);
    // res.status(500).json({ error: "Failed to process the question" });
  }
});

app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
