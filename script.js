"use strict";
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Selectors
const hintBtn = document.getElementById("hint-btn");
const solnBtn = document.getElementById("soln-btn");
const inputElement = document.querySelector(".question-input");
const resultList = document.querySelector(".result-list");
const spinner = document.getElementById("spinner");
const menu = document.querySelector(".menu");
const menuItems = document.querySelectorAll(".menu li");
const selectElement = document.querySelector(".selected");
const questionBar = document.getElementById("question-name-box");
const popup = document.querySelector(".popup");
const loadMessage = document.createElement("li");
const dropdown = document.querySelector(".dropdown");
let questionName = questionBar.value;
let language = selectElement.textContent;
let editor = "";
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Object of sample codes for each language
const helloWorldFunctions = {
  JavaScript: '"console.log("Hello, World!")"',
  Python: 'print("Hello, World!");',
  Java: 'System.out.println("Hello, World!");',
  C: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
  "C++":
    '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
  Ruby: 'puts "Hello, World!"',
  Go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
  Rust: 'fn main() {\n    println!("Hello, World!");\n}',
  Swift: 'print("Hello, World!")',
  Kotlin: 'fun main() {\n    println("Hello, World!")\n}',
  TypeScript: 'console.log("Hello, World!");',
  "C#": 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Hello, World!");\n    }\n}',
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Helpers:
// 1. function to apply a given action to all the menu items (for animation purposes)
function applyToMenu(action) {
  const toggleChange = (item) => {
    item.classList.toggle("hidden");
  };
  const addChange = (item) => {
    item.classList.add("hidden");
  };

  if (action === "toggle") {
    menu.classList.toggle("hidden");
    menuItems.forEach((item, index) => {
      setTimeout(() => toggleChange(item), index * 50);
    });
  } else {
    menu.classList.add("hidden");
    menuItems.forEach((item, index) => {
      setTimeout(() => addChange(item), index * 50);
    });
  }
}

// 2. Function to check if a string is in an object's values
function isStringInObjectValues(obj, targetString) {
  for (const value of Object.values(obj)) {
    if (value === targetString) {
      return true;
    }
  }
  return false;
}

// 3. Error handling of user leaving input boxes empty
function validInputs() {
  language = selectElement.textContent;
  questionName = questionBar.value;
  let code = editor.getValue();
  if (language == "Coding Language") {
    displayPopup("Please choose a coding language");
    setTimeout(closePopup, 1500);
    return false;
  } else if (questionName == "") {
    displayPopup("Please type in the leetcode question name");
    setTimeout(closePopup, 1500);
    return false;
  } else if (code == "") {
    displayPopup("Please type in your code");
    setTimeout(closePopup, 1500);
    return false;
  } else {
    return true;
  }
}

// 4. Pop-up handling
// 4(a) function to show the popup
function displayPopup(message) {
  popup.textContent = message;
  popup.style.display = "block";
  popup.classList.add("popup-enter");

  setTimeout(() => {
    popup.classList.remove("popup-enter");
  }, 1500);

  setTimeout(closePopup, 2000);
}
// 4(b) function to close the popup
function closePopup() {
  popup.classList.add("popup-exit");

  setTimeout(() => {
    popup.classList.remove("popup-exit");
    popup.style.display = "none";
  }, 3500);
}

// 5. Function to display text as an animation (kind of lol)
function animateTyping(element, text, speed) {
  return new Promise((resolve) => {
    let i = 0;

    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        ++i;
        setTimeout(type, speed);
      } else {
        resolve(); // Resolve the promise when typing animation is complete
      }
    }

    type();
  });
}

// 6. Function to reverse the done animation
function reverseAnimateTyping(element, text, speed) {
  return new Promise((resolve) => {
    let i = text.length;

    function unType() {
      if (i >= 0) {
        element.textContent = text.slice(0, i);
        i--;
        setTimeout(unType, speed);
      } else {
        resolve(); // Resolve the promise when reverse typing animation is complete
      }
    }

    unType();
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Processes:
// 1. Loading monaco text/code editor
require.config({ paths: { vs: "node_modules/monaco-editor/min/vs" } });
// 2. Loading the visuals for the code editor,
require(["vs/editor/editor.main"], function () {
  editor = monaco.editor.create(document.getElementById("code-input-box"), {
    value: helloWorldFunctions[language.toLowerCase()],
    language: language,
  });
  monaco.editor.setTheme("vs-dark");
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// MAIN FUNCTIONS MAIN FUNCTIONS MAIN FUNCTIONS MAIN FUNCTIONS MAIN FUNCTIONS
// 1. Function to handle the process once all requirements have been fulfilled
// (user chose a language, typed the name of the question, and typed his code)
const displayResponse = async (e, hint) => {
  e.preventDefault();
  resultList.scrollIntoView({ behavior: "smooth" });
  // If inputs have an issue, let thef validInputs function handle it
  if (!validInputs()) {
    return;
  }

  // Initialize the spinner
  spinner.style.display = "block";
  resultList.innerHTML = "";
  resultList.appendChild(loadMessage);

  // Get the name of the LeetCode question the user inputted
  const codeInQuestion = editor.getValue();

  // animate the message
  await animateTyping(loadMessage, "Thinking about the best hints...", 60);
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Delay before starting the reverse typing animation
  // reverse type the animated text while the user waits for the response
  await reverseAnimateTyping(
    loadMessage,
    "Thinking about the best hints...",
    30
  );

  // Reset the content
  resultList.innerHTML = "";

  let result = await postQuestion(codeInQuestion, hint, language);
  let notCodeTest = result.response.toUpperCase();
  // split based on hints

  if (notCodeTest.includes("NOT A CODING")) {
    // Handle the special case
    resultList.innerHTML = "THIS IS NOT A CODING QUESTION";
    spinner.style.display = "none";
    return;
  }
  if (hint) {
    const splitResult = result.response.split(/\d+\./);
    // remove spinner
    spinner.style.display = "none";

    // make a new element for each of the three hints and animate them
    for (const [index, point] of splitResult.entries()) {
      if (index != 0) {
        const listItem = document.createElement("li");
        resultList.appendChild(listItem);

        await animateTyping(listItem, `${index}. ` + point, 20);
      }
    }
  } else {
    const splitResult = result.response.split(`\n`);
    spinner.style.display = "none";

    // make a new element for each of the three hints and animate them
    for (const [index, point] of splitResult.entries()) {
      if (index != 0) {
        const listItem = document.createElement("li");
        resultList.appendChild(listItem);

        await animateTyping(listItem, point, 20);
      }
    }
  }
};

// 2. Function to send the request and return the result
const postQuestion = async (codeInQuestion, hint, languageSelected) => {
  // based on the user choosing hint or solution, select the action key senetence
  let prompt = "";
  let action = hint
    ? "provide three very SPECIFIC hints on how to FIX my code"
    : "provide the solution for this question";
  // engineer the prompt
  if (hint) {
    prompt = `I'm working on the ${questionName} in ${languageSelected}, ${action}:\n${codeInQuestion}\nLimit your response to 250 characters. Respond with "THIS IS NOT A CODING QUESTION" if not relevant. Split each hint by number then a dot`;
  } else {
    prompt = `Given this code, ${codeInQuestion}, provide the solution for this leetcode question ${questionName}, limit your response to ONLY a very short and brief introductory statement, followed by a newline followed by the code solution in ${languageSelected}`;
  }

  // Send the request with the needed configurations
  try {
    const response = await fetch("/processQuestion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: prompt,
      }),
    });

    // Error handling
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    // set up response and return it
    const data = await response.json();
    return data;
  } catch (error) {
    // Error handling
    // console.error(error);
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Event Listeners:
// 1.
hintBtn.addEventListener("click", async (event) => {
  questionName = questionBar.value;

  displayResponse(event, true, language);
});
// 2.
solnBtn.addEventListener("click", async (event) => {
  displayResponse(event, false, language);
});
// 3.
window.addEventListener("click", function (event) {
  if (!dropdown.contains(event.target)) {
    applyToMenu("add");
  }
});
// 4.
dropdown.addEventListener("click", function (e) {
  e.stopPropagation();
  applyToMenu("toggle");
});

// 5. Adding event listeners to each item in the dropdown menu
menuItems.forEach(function (item) {
  item.addEventListener("click", function () {
    // Identify the selected language
    selectElement.textContent = this.textContent;
    language = selectElement.textContent;
    // Get the code that the user inputted
    let currContent = editor.getValue();

    // Resettig the current editor so new language and visuals can be loaded
    if (editor) {
      editor.dispose();
    }
    // If the user chise a new language andhasn't made any changes to the sample code, replace it with
    // a corresponding sample code based on the language that they chose
    if (
      currContent == "" ||
      isStringInObjectValues(helloWorldFunctions, currContent)
    ) {
      currContent = helloWorldFunctions[language];
    } else {
      currContent = currContent;
    }
    // Create a new Monaco editor with the updated language and sample code
    editor = monaco.editor.create(document.getElementById("code-input-box"), {
      value: currContent,
      language: language.toLowerCase(), // Set the language based on the selected item
    });
    monaco.editor.setTheme("vs-dark");
  });
});

// 6. Adding event listener to the input box
inputElement.addEventListener("input", (e) => {
  e.preventDefault();
  inputElement.style.height = "auto";
  inputElement.style.height = inputElement.scrollHeight + "px";
});
