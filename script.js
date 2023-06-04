"use strict";

const hintBtn = document.getElementById("hint-btn");
const solnBtn = document.getElementById("soln-btn");
const inputElement = document.querySelector(".question-input");
const resultList = document.querySelector(".result-list");
const spinner = document.getElementById("spinner");
const menu = document.querySelector(".menu");
const menuItems = document.querySelectorAll(".menu li");
const selectElement = document.querySelector(".selected");
const questionBar = document.getElementById("question-name-box");
let questionName = questionBar.value;
let language = selectElement.textContent;
const popup = document.querySelector(".popup");

function validInputs() {
  language = selectElement.textContent;
  questionName = questionBar.value;
  let code = editor.getValue();
  if (language == "Coding Language") {
    console.log("everything not good 1");
    displayPopup("Please choose a coding language");
    setTimeout(closePopup, 1500);

    return false;
  } else if (questionName == "") {
    console.log("everything not good 2");
    displayPopup("Please type in the leetcode question name");
    setTimeout(closePopup, 1500);
    return false;
  } else if (code == "") {
    console.log("everything not good 3");
    displayPopup("Please type in your code");
    setTimeout(closePopup, 1500);
    return false;
  } else {
    console.log("this is my nice code ", code);
    return true;
  }
}

function displayPopup(message) {
  popup.textContent = message;
  popup.style.display = "block";
  popup.classList.add("popup-enter");

  setTimeout(() => {
    popup.classList.remove("popup-enter");
  }, 1500);

  setTimeout(closePopup, 2000);
}

function closePopup() {
  popup.classList.add("popup-exit");

  setTimeout(() => {
    popup.classList.remove("popup-exit");
    popup.style.display = "none";
  }, 3500);
}

require.config({ paths: { vs: "node_modules/monaco-editor/min/vs" } });
let editor = "";

require(["vs/editor/editor.main"], function () {
  console.log("the user choose language -> ", language);
  // language = language == "Coding Language" ? "JavaScript" : language;
  editor = monaco.editor.create(document.getElementById("code-input-box"), {
    value: ["function x() {", '\tconsole.log("Hello world!");', "}"].join("\n"),
    language: `${language}`,
  });
  monaco.editor.setTheme("vs-dark");

  // console.log("Test");
});

menuItems.forEach(function (item) {
  item.addEventListener("click", function () {
    selectElement.textContent = this.textContent;
    language = selectElement.textContent;
    console.log(selectElement.textContent);
    if (editor) {
      editor.dispose();
    }

    // Create a new Monaco editor with the updated language
    editor = monaco.editor.create(document.getElementById("code-input-box"), {
      value: ["function x() {", '\tconsole.log("Hello world!");', "}"].join(
        "\n"
      ),
      language: language.toLowerCase(), // Set the language based on the selected item
    });
    monaco.editor.setTheme("vs-dark");
    // editor.setModelLanguage(editor.getModel(), language.toLowerCase());
    // dropdown.querySelector(".menu").style.display = "none";
  });
});

inputElement.addEventListener("input", (e) => {
  e.preventDefault();
  inputElement.style.height = "auto";
  inputElement.style.height = inputElement.scrollHeight + "px";
});
const displayResponse = async (e, hint) => {
  e.preventDefault();
  if (!validInputs()) {
    return;
  }
  const inputCode = editor.getValue();

  spinner.style.display = "block";
  resultList.innerHTML = "";

  const loadMessage = document.createElement("li");
  resultList.appendChild(loadMessage);

  const question = editor.getValue();
  console.log("this is the question ", question);

  await animateTyping(loadMessage, "Thinking about the best hints...", 30);
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Delay before starting the reverse typing animation
  await reverseAnimateTyping(
    loadMessage,
    "Thinking about the best hints...",
    30
  );

  resultList.innerHTML = "";

  const result = await postQuestion(question, hint, language);
  console.log(result);
  const splitResult = result.response.split(/\s*Hint\s+(?=\d+:)/);
  spinner.style.display = "none";

  for (const point of splitResult) {
    const listItem = document.createElement("li");
    resultList.appendChild(listItem);

    await animateTyping(listItem, point, 20);
  }
};

const postQuestion = async (question, hint, languageSelected) => {
  console.log(question);
  let action = hint
    ? "provide three concise hints on how to fix my code"
    : "provide the solution for this question";
  let prompt = `I'm working on the ${questionName} in ${languageSelected}, ${action}:\n${question}\nLimit your response to 250 characters. Respond with "THIS IS NOT A CODING QUESTION" if not relevant.`;

  console.log("thisistheprompt", prompt);
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

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
  }
};

function animateTyping(element, text, speed) {
  return new Promise((resolve) => {
    let i = 0;

    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        // i = text.length <= i + 2 ? i + 1 : i + 2;
        ++i;
        setTimeout(type, speed);
      } else {
        resolve(); // Resolve the promise when typing animation is complete
      }
    }

    type();
  });
}

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

hintBtn.addEventListener("click", async (event) => {
  console.log("this is my inquiry", questionName);
  displayResponse(event, true, language);
});

solnBtn.addEventListener("click", async (event) => {
  displayResponse(event, false, language);
});

var dropdown = document.querySelector(".dropdown");
dropdown.addEventListener("click", function () {
  menu.style.display = menu.style.display === "none" ? "block" : "none";
});
