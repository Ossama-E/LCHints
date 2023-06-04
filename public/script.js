"use strict";

const hintBtn = document.getElementById("hint-btn");
const solnBtn = document.getElementById("soln-btn");
const inputElement = document.querySelector(".question-input");
const resultList = document.querySelector(".result-list");

inputElement.addEventListener("input", (e) => {
  e.preventDefault();
  inputElement.style.height = "auto";
  inputElement.style.height = inputElement.scrollHeight + "px";
});
const displayResponse = async (e, hint) => {
  e.preventDefault();
  resultList.innerHTML = "";

  const loadMessage = document.createElement("li");
  resultList.appendChild(loadMessage);

  const question = inputElement.value;

  await animateTyping(loadMessage, "Thinking about the best hints...", 30);
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Delay before starting the reverse typing animation
  await reverseAnimateTyping(
    loadMessage,
    "Thinking about the best hints...",
    30
  );

  resultList.innerHTML = "";

  const result = await postQuestion(question, hint);
  console.log(result);
  const splitResult = result.response.split(/\s*Hint\s+(?=\d+:)/);

  for (const point of splitResult) {
    const listItem = document.createElement("li");
    resultList.appendChild(listItem);

    await animateTyping(listItem, point, 20);
  }
};

const postQuestion = async (question, hint) => {
  let prompt = hint
    ? "Please provide three concise and explicit hints to assist with fixing my code for this LeetCode question. I'm seeking guidance to resolve the issue effectively. limit your response to 250 characters" +
      question +
      ` IF THIS IS NOT A LEETCODE OR CODING QUESTION PLEASE RESPOND WITH "THIS IS NOT A CODING QUESTION"`
    : "Please provide the solution for this question, limit your response to 250 characters" +
      question +
      ` IF THIS IS NOT A LEETCODE OR CODING QUESTION PLEASE RESPOND WITH "THIS IS NOT A CODING QUESTION"`;

  try {
    const response = await axios.post(
      "/processQuestion",
      {
        question: prompt,
      },
      { headers: { "Content-Type": "application/json" } }
    );

    return response.data;
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
  displayResponse(event);
});

solnBtn.addEventListener("click", async (event) => {
  displayResponse(event, false);
});
