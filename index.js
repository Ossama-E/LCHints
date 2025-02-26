require("dotenv").config()
const express = require("express")
const axios = require("axios")
const path = require("path")
const bodyParser = require("body-parser")
const rateLimit = require('express-rate-limit')
const app = express()
const port = process.env.PORT || 3000

const { Configuration, OpenAIApi } = require("openai")

const configuration = new Configuration({
   apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const runPrompt = async (prompt) => {
   try {
      const response = await openai.createChatCompletion({
         model: process.env.OPENAI_MODEL,
         messages: [
            {
               role: "user",
               content: prompt,
            },
         ],
         temperature: 0.7,
         max_tokens: 1000,
      })
      if (!response.data?.choices?.[0]?.message?.content) {
         throw new Error('Invalid response structure from OpenAI')
      }
      
      return response.data.choices[0].message.content
   } catch (error) {
      throw error
   }
}

// Rate limiting:
const limiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 100 // 100 per 15 mins
})

// Middleware
app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(limiter)

// Add logging middleware
app.use((req, res, next) => {
   console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
   next()
})

// Validation middleware
const validateApiRequest = (req, res, next) => {
   const { question, language, code } = req.body
   if (!question || !language || !code) {
      return res.status(400).json({ error: 'Missing required fields' })
   }
   next()
}

// Error handling middleware
app.use((err, req, res, next) => {
   console.error('Global Error Handler:', err)
   res.status(500).json({
      error: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
   })
})

app.post("/processQuestion", async (req, res) => {
   try {
      const { question, language, code } = req.body
      
      if (!question) {
         return res.status(400).json({ error: 'Question prompt is required' })
      }

      const response = await runPrompt(question)

      res.json({ 
         success: true,
         response: response.trim() // Clean up any extra whitespace
      })

   } catch (error) {
      console.error("Backend Error:", error)
      res.status(500).json({ 
         success: false,
         error: 'Failed to process request',
         message: error.message
      })
   }
})

app.use(express.static("public"))

app.listen(port, () => {
   console.log(`Server is running on port ${port}`)
})
