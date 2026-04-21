const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");

const history = [];
const API_URL = "https://virtual-avatar-backend.onrender.com/api/chat";

function getSessionId() {
  let sessionId = localStorage.getItem("va_session_id");

  if (!sessionId) {
    sessionId =
      "session_" +
      Date.now() +
      "_" +
      Math.random().toString(36).slice(2);

    localStorage.setItem("va_session_id", sessionId);
  }

  return sessionId;
}

function addMessage(role, content) {
  const bubble = document.createElement("div");
  bubble.className = `message ${role}`;
  bubble.textContent = content;
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addTypingIndicator() {
  const typing = document.createElement("div");
  typing.className = "message assistant typing";
  typing.id = "typingIndicator";
  typing.textContent = "Typing...";
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
  const typing = document.getElementById("typingIndicator");
  if (typing) typing.remove();
}

function setLoading(isLoading) {
  const button = chatForm.querySelector("button");
  button.disabled = isLoading;
  messageInput.disabled = isLoading;
  button.textContent = isLoading ? "Sending..." : "Send";
}

async function sendMessage(message) {
  const cleanMessage = message.trim();
  if (!cleanMessage) return;

  addMessage("user", cleanMessage);
  history.push({ role: "user", content: cleanMessage });

  setLoading(true);
  addTypingIndicator();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: cleanMessage,
        sessionId: getSessionId(),
        history
      })
    });

    const data = await response.json();

    removeTypingIndicator();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    const reply =
      data.reply ||
      "Sorry, I could not generate a response right now.";

    addMessage("assistant", reply);
    history.push({ role: "assistant", content: reply });
  } catch (error) {
    removeTypingIndicator();
    addMessage(
      "assistant",
      "Sorry, there was a problem connecting to the demo. Please try again."
    );
    console.error("Chat error:", error);
  } finally {
    setLoading(false);
    messageInput.focus();
  }
}

function sendPrompt(promptText) {
  sendMessage(promptText);
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = messageInput.value.trim();
  if (!message) return;

  messageInput.value = "";
  await sendMessage(message);
});

window.sendPrompt = sendPrompt;

window.addEventListener("load", () => {
  addMessage(
    "assistant",
    "Welcome. This demo shows how a Virtual Avatar can greet website visitors, answer common questions, and guide them toward taking action. Ask me how it works, how it helps businesses, or how it could work on your website."
  );

  messageInput.focus();
});