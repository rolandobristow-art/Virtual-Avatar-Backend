const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");

const startBtn = document.getElementById("startAvatarBtn");
const avatarStatus = document.getElementById("avatarStatus");

const history = [];
const API_URL = "https://virtual-avatar-backend.onrender.com/api/chat";
const AVATAR_TOKEN_API = "https://virtual-avatar-backend.onrender.com/api/liveavatar/token";
const AVATAR_START_API = "https://virtual-avatar-backend.onrender.com/api/liveavatar/start";

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

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    removeTypingIndicator();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    const reply =
      data.reply || "Sorry, I could not generate a response right now.";

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

async function startAvatar() {
  try {
    if (!avatarStatus) return;

    avatarStatus.textContent = "Getting avatar token...";

    const tokenRes = await fetch(AVATAR_TOKEN_API);
    let tokenData = {};

    try {
      tokenData = await tokenRes.json();
    } catch {
      tokenData = {};
    }

    if (!tokenRes.ok) {
      throw new Error(tokenData.error || "Failed to get avatar token.");
    }

    const sessionId = tokenData?.data?.session_id;
    const sessionToken = tokenData?.data?.session_token;

    if (!sessionId || !sessionToken) {
      throw new Error("Missing avatar session details.");
    }

    avatarStatus.textContent = "Starting avatar session...";

    const startRes = await fetch(AVATAR_START_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        session_id: sessionId,
        session_token: sessionToken
      })
    });

    let startData = {};

    try {
      startData = await startRes.json();
    } catch {
      startData = {};
    }

    if (!startRes.ok) {
      throw new Error(startData.error || "Failed to start avatar session.");
    }

    console.log("LiveAvatar token response:", tokenData);
    console.log("LiveAvatar start response:", startData);

    avatarStatus.textContent = "Avatar session created";
  } catch (err) {
    console.error("Avatar start error:", err);
    if (avatarStatus) {
      avatarStatus.textContent = "Failed to start avatar";
    }
  }
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = messageInput.value.trim();
  if (!message) return;

  messageInput.value = "";
  await sendMessage(message);
});

if (startBtn) {
  startBtn.addEventListener("click", startAvatar);
}

window.sendPrompt = sendPrompt;

window.addEventListener("load", () => {
  addMessage(
    "assistant",
    "Welcome. This demo shows how a Virtual Avatar can greet website visitors, answer common questions, and guide them toward taking action. Ask me how it works, how it helps businesses, or how it could work on your website."
  );

  messageInput.focus();
});