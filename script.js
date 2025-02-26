"use strict"
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Selectors
const hintBtn = document.getElementById("hint-btn")
const solnBtn = document.getElementById("soln-btn")
const inputElement = document.querySelector(".question-input")
const resultList = document.querySelector(".result-list")
const spinner = document.getElementById("spinner")
const menu = document.querySelector(".menu")
const menuItems = document.querySelectorAll(".menu li")
const selectElement = document.querySelector(".selected")
const questionBar = document.getElementById("question-name-box")
const popup = document.querySelector(".popup")
const loadMessage = document.createElement("li")
const dropdown = document.querySelector(".dropdown")
const historyPanel = document.getElementById('history-panel')
const toggleHistory = document.getElementById('toggle-history')
const clearHistory = document.getElementById('clear-history')
const historyList = document.getElementById('history-list')
let questionName = questionBar.value
let language = selectElement.textContent
let editor = ""
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Object of sample codes for each language
const helloWorldFunctions = {
   JavaScript: '"console.log("Hello, World!")"',
   Python: 'print("Hello, World!");',
   Java: 'System.out.println("Hello, World!");',
   C: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
   "C++": '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
   Ruby: 'puts "Hello, World!"',
   Go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
   Rust: 'fn main() {\n    println!("Hello, World!");\n}',
   Swift: 'print("Hello, World!")',
   Kotlin: 'fun main() {\n    println("Hello, World!")\n}',
   TypeScript: 'console.log("Hello, World!");',
   "C#": 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Hello, World!");\n    }\n}',
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Helpers:
// 1. function to apply a given action to all the menu items (for animation purposes)
function applyToMenu(action) {
   const toggleChange = (item) => {
      item.classList.toggle("hidden")
   }
   const addChange = (item) => {
      item.classList.add("hidden")
   }

   if (action === "toggle") {
      menu.classList.toggle("hidden")
      menuItems.forEach((item, index) => {
         setTimeout(() => toggleChange(item), index * 50)
      })
   } else {
      menu.classList.add("hidden")
      menuItems.forEach((item, index) => {
         setTimeout(() => addChange(item), index * 50)
      })
   }
}

// 2. Function to check if a string is in an object's values
function isStringInObjectValues(obj, targetString) {
   for (const value of Object.values(obj)) {
      if (value === targetString) {
         return true
      }
   }
   return false
}

// 3. Error handling of user leaving input boxes empty
function validInputs() {
   language = selectElement.textContent
   questionName = questionBar.value
   let code = editor.getValue()
   if (language == "Coding Language") {
      displayPopup("Please choose a coding language")
      setTimeout(closePopup, 1500)
      return false
   } else if (questionName == "") {
      displayPopup("Please type in the leetcode question name")
      setTimeout(closePopup, 1500)
      return false
   } else if (code == "") {
      displayPopup("Please type in your code")
      setTimeout(closePopup, 1500)
      return false
   } else {
      return true
   }
}

// 4. Pop-up handling
// 4(a) function to show the popup
function displayPopup(message) {
   popup.textContent = message
   popup.style.display = "block"
   popup.classList.add("popup-enter")

   setTimeout(() => {
      popup.classList.remove("popup-enter")
   }, 1500)

   setTimeout(closePopup, 2000)
}
// 4(b) function to close the popup
function closePopup() {
   popup.classList.add("popup-exit")

   setTimeout(() => {
      popup.classList.remove("popup-exit")
      popup.style.display = "none"
   }, 3500)
}

// 5. Function to display text as an animation (kind of lol)
function animateTyping(element, text, speed) {
   return new Promise((resolve) => {
      let i = 0

      function type() {
         if (i < text.length) {
            element.textContent += text.charAt(i)
            ++i
            setTimeout(type, speed)
         } else {
            resolve() // Resolve the promise when typing animation is complete
         }
      }

      type()
   })
}

// 6. Function to reverse the done animation
function reverseAnimateTyping(element, text, speed) {
   return new Promise((resolve) => {
      let i = text.length

      function unType() {
         if (i >= 0) {
            element.textContent = text.slice(0, i)
            i--
            setTimeout(unType, speed)
         } else {
            resolve() // Resolve the promise when reverse typing animation is complete
         }
      }

      unType()
   })
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Processes:
// 1. Loading monaco text/code editor
require.config({ paths: { vs: "node_modules/monaco-editor/min/vs" } })
// 2. Loading the visuals for the code editor,
require(["vs/editor/editor.main"], function () {
   editor = monaco.editor.create(document.getElementById("code-input-box"), {
      value: helloWorldFunctions[language.toLowerCase()],
      language: language,
   })
   monaco.editor.setTheme("vs-dark")
})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// MAIN FUNCTIONS MAIN FUNCTIONS MAIN FUNCTIONS MAIN FUNCTIONS MAIN FUNCTIONS
// 1. Function to handle the process once all requirements have been fulfilled
// (user chose a language, typed the name of the question, and typed his code)
const displayResponse = async (e, hint) => {
   e.preventDefault()
   try {
      if (!validInputs()) {
         return
      }

      // Disable buttons during request
      disableButtons()

      // Show loading state
      resultList.scrollIntoView({ behavior: "smooth" })
      spinner.style.display = "block"
      resultList.innerHTML = ""
      resultList.appendChild(loadMessage)

      const codeInQuestion = editor.getValue()

      // Animate loading message
      await animateTyping(loadMessage, "Thinking about the best hints...", 60)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      await reverseAnimateTyping(loadMessage, "Thinking about the best hints...", 30)

      // Reset content
      resultList.innerHTML = ""

      // Make API request
      const result = await postQuestion(codeInQuestion, hint, language)
      
      console.log('API Response:', result)

      // Check if it's not a coding question
      if (result.response.toUpperCase().includes("NOT A CODING")) {
         resultList.innerHTML = "THIS IS NOT A CODING QUESTION"
         return
      }

      // Save to history after successful response
      saveToHistory(questionBar.value, codeInQuestion, language, result.response)

      // Handle hints or solution
      if (hint) {
         const hints = result.response.split(/\d+\./).filter(hint => hint.trim())
         for (let i = 0; i < hints.length; i++) {
            const listItem = document.createElement("li")
            resultList.appendChild(listItem)
            await animateTyping(listItem, `${i + 1}. ${hints[i].trim()}`, 20)
         }
      } else {
         const lines = result.response.split('\n').filter(line => line.trim())
         for (const line of lines) {
            const listItem = document.createElement("li")
            resultList.appendChild(listItem)
            await animateTyping(listItem, line, 20)
         }
      }

   } catch (error) {
      console.error('Error in displayResponse:', error)
      resultList.innerHTML = "An error occurred. Please try again."
   } finally {
      spinner.style.display = "none"
      enableButtons()
   }
}

// 2. Function to generate exact prompt
const generatePrompt = (questionName, language, codeInQuestion, hint) => {
   if (hint) {
      return `For the LeetCode question "${questionName}" in ${language}, here is my code:
      
${codeInQuestion}

Please provide exactly three clear and concise hints on how to solve this problem. Format them as:
1. First hint
2. Second hint
3. Third hint`
   } else {
      return `For the LeetCode question "${questionName}" in ${language}, here is my code:
      
${codeInQuestion}

Please provide a complete solution with a brief explanation. Format the response as clear text without any markdown or code block syntax.`
   }
}

// 3. Function to send the request and return the result
const postQuestion = async (codeInQuestion, hint, languageSelected) => {
   try {
      const prompt = generatePrompt(questionName, languageSelected, codeInQuestion, hint)
      console.log('Sending request:', { prompt, languageSelected, codeInQuestion })

      const response = await fetch("/processQuestion", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({
            question: prompt,
            language: languageSelected,
            code: codeInQuestion
         }),
      })

      if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success && data.error) {
         throw new Error(data.error)
      }

      return data

   } catch (error) {
      console.error('postQuestion Error:', error)
      throw error
   }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Event Listeners:
// 1. Click on the hint button to receive hints
hintBtn.addEventListener("click", async (event) => {
   questionName = questionBar.value

   displayResponse(event, true, language)
})
// 2. Click on the solution button to get full soln
solnBtn.addEventListener("click", async (event) => {
   displayResponse(event, false, language)
})
// 3. Click outside dropdown to close it
window.addEventListener("click", function (event) {
   if (!dropdown.contains(event.target)) {
      applyToMenu("add")
   }
})
// 4. Dropdown menu
dropdown.addEventListener("click", function (e) {
   e.stopPropagation()
   applyToMenu("toggle")
})

// 5. Adding event listeners to each item in the dropdown menu
menuItems.forEach(function (item) {
   item.addEventListener("click", function () {
      // Identify the selected language
      selectElement.textContent = this.textContent
      language = selectElement.textContent
      // Get the code that the user inputted
      let currContent = editor.getValue()

      // Resettig the current editor so new language and visuals can be loaded
      if (editor) {
         editor.dispose()
      }
      // If the user chise a new language andhasn't made any changes to the sample code, replace it with
      // a corresponding sample code based on the language that they chose
      if (currContent == "" || isStringInObjectValues(helloWorldFunctions, currContent)) {
         currContent = helloWorldFunctions[language]
      } else {
         currContent = currContent
      }
      // Create a new Monaco editor with the updated language and sample code
      editor = monaco.editor.create(document.getElementById("code-input-box"), {
         value: currContent,
         language: language.toLowerCase(), // Set the language based on the selected item
      })
      monaco.editor.setTheme("vs-dark")
   })
})

// 6. Adding event listener to the input box
inputElement.addEventListener("input", (e) => {
   e.preventDefault()
   inputElement.style.height = "auto"
   inputElement.style.height = inputElement.scrollHeight + "px"
})

// Local Storage Management
const STORAGE_KEY = 'leetcode_hints_history'

const saveToHistory = (question, code, language, response) => {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    
    // Only save if we have actual content
    if (!question || !code) return
    
    // Check if it's a non-LeetCode question response
    if (response.toUpperCase().includes("NOT A CODING") || 
        response.toUpperCase().includes("NOT A LEETCODE")) {
        console.log('Not saving non-LeetCode question to history')
        return
    }

    const historyItem = {
        timestamp: new Date().toISOString(),
        question: question.trim(),
        code: code.trim(),
        language: language || 'Unknown',
        response: response
    }

    // Don't add duplicate entries
    const isDuplicate = history.some(item => 
        item.question === historyItem.question && 
        item.code === historyItem.code &&
        item.language === historyItem.language
    )

    if (!isDuplicate) {
        history.unshift(historyItem)
        if (history.length > 10) history.pop()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
        renderHistory()
    }
}

const loadHistory = () => {
   return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
}

// Helper functions for better code organization
const showLoadingState = () => {
   spinner.style.display = "block"
   resultList.innerHTML = ""
   resultList.appendChild(loadMessage)
}

const hideLoadingState = () => {
   spinner.style.display = "none"
}

const handleError = (error) => {
   console.error('Error:', error)
   resultList.innerHTML = "An error occurred. Please try again."
}

// Add theme toggle functionality
const toggleTheme = () => {
   document.body.classList.toggle('light-theme')
   localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark')
}

// Initialize theme from localStorage
document.body.classList.toggle('light-theme', localStorage.getItem('theme') === 'light')

// Add button disable/enable functions
const disableButtons = () => {
    hintBtn.disabled = true
    solnBtn.disabled = true
    hintBtn.style.opacity = '0.5'
    solnBtn.style.opacity = '0.5'
    toggleHistory.disabled = true
    toggleHistory.style.opacity = '0.5'
}

const enableButtons = () => {
    hintBtn.disabled = false
    solnBtn.disabled = false
    hintBtn.style.opacity = '1'
    solnBtn.style.opacity = '1'
    toggleHistory.disabled = false
    toggleHistory.style.opacity = '1'
}

// Wait for DOM to load before trying to find elements
document.addEventListener('DOMContentLoaded', () => {
    const historyPanel = document.getElementById('history-panel')
    const toggleHistory = document.getElementById('toggle-history')
    const clearHistory = document.getElementById('clear-history')
    const historyList = document.getElementById('history-list')

    if (!historyPanel || !toggleHistory) {
        console.error('History elements not found:', {
            panel: historyPanel,
            button: toggleHistory
        })
        return
    }

    toggleHistory.addEventListener('click', () => {
        console.log('Toggling history panel')
        historyPanel.classList.toggle('open')
    })

    if (clearHistory) {
        clearHistory.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all history?')) {
                localStorage.removeItem(STORAGE_KEY)
                renderHistory()
            }
        })
    }

    // Initial render
    renderHistory()
})

// Keep your existing constants and functions here
const renderHistory = () => {
    const historyList = document.getElementById('history-list')
    if (!historyList) return

    const history = loadHistory()
    historyList.innerHTML = ''
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="history-item"><p>No history yet</p></div>'
        return
    }

    history.forEach(item => {
        // Skip rendering if it's a non-LeetCode question
        if (item.response && (
            item.response.toUpperCase().includes("NOT A CODING") || 
            item.response.toUpperCase().includes("NOT A LEETCODE")
        )) {
            return
        }

        const historyItem = document.createElement('div')
        historyItem.className = 'history-item'
        
        const date = new Date(item.timestamp).toLocaleDateString()
        const time = new Date(item.timestamp).toLocaleTimeString()
        
        historyItem.innerHTML = `
            <h4>${item.question || 'Untitled'}</h4>
            <div class="history-meta">
                ${date} ${time} • ${item.language || 'Unknown'}
            </div>
            <div class="history-preview">
                ${item.code ? item.code.split('\n')[0] : 'No code'}...
            </div>
        `
        
        // Updated click handler to properly restore state
        historyItem.addEventListener('click', () => {
            // Restore question name
            questionBar.value = item.question

            // Restore language selection
            language = item.language // Update the global language variable
            const langButton = document.querySelector('.language-select')
            if (langButton) {
                langButton.textContent = item.language
            }

            // Restore code in editor
            if (editor) {
                editor.setValue(item.code)
                // Force the editor to update
                editor.clearSelection()
                editor.focus()
            }

            // Close the history panel
            const historyPanel = document.getElementById('history-panel')
            if (historyPanel) {
                historyPanel.classList.remove('open')
            }
        })
        
        historyList.appendChild(historyItem)
    })
}
