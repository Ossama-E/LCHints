const express = require("express")
const axios = require("axios")
const path = require("path")
const bodyParser = require("body-parser")
const app = express()
const port = process.env.PORT || 3000
require("dotenv").config()

const { Configuration, OpenAIApi } = require("openai")

const config = new Configuration({
   apiKey: process.env.API_KEY,
})

const openai = new OpenAIApi(config)

const runPrompt = async (prompt) => {
   try {
      const response = await openai.createChatCompletion({
         model: "gpt-4o-mini",
         messages: [
            {
               role: "user",
               content: prompt,
            },
         ],
      })
      return response.data.choices[0].message.content
   } catch (error) {
      console.log("Failed to generate completion")
   }
}

app.use(express.static(__dirname))
app.use(bodyParser.json()) // Parse JSON request bodies

app.post("/processQuestion", async (req, res) => {
   // Extract the question from the request body
   const question = req.body.question
   try {
      // Call the OpenAI API using async/await and await the response
      const response = await runPrompt(question)
      res.json({ response })
   } catch (error) {
      console.error("Error:-post", error)
      // res.status(500).json({ error: "Failed to process the question" });
   }
})

app.use(express.static("public"))

app.listen(port, () => {
   console.log(`Listening on port ${port}`)
})
