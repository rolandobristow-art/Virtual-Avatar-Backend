import './style.css';

// Basic variables
const avatarContainer = document.getElementById("avatarContainer");
const avatarStatus = document.getElementById("avatarStatus");
const startBtn = document.getElementById("startAvatarBtn");
const avatarInput = document.getElementById("avatarInput");
const avatarSendBtn = document.getElementById("avatarSendBtn");
const avatarMicBtn = document.getElementById("avatarMicBtn");

const AVATAR_TOKEN_API = "https://virtual-avatar-backend.onrender.com/api/liveavatar/token";

// ====================== START AVATAR ======================
async function startAvatar() {
  try {
    avatarStatus.textContent = "Starting avatar...";
    avatarStatus.style.color = "orange";

    const res = await fetch(AVATAR_TOKEN_API);
    const data = await res.json();

    if (data.code !== 1000) throw new Error(data.message || "Session failed");

    const sessionToken = data.data?.data?.session_token || data.data?.session_token;
    if (!sessionToken) throw new Error("No token received");

    avatarContainer.innerHTML = "";

    const { LiveAvatarSession } = await import("@heygen/liveavatar-web-sdk");

    const session = new LiveAvatarSession(sessionToken, {
      mode: "LITE",
      quality: "high",
      orientation: "horizontal",
    });

    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.muted = false;
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";

    avatarContainer.appendChild(video);

    session.on("streamReady", () => session.attach(video));

    await session.start();
    window.currentAvatarSession = session;

    avatarStatus.textContent = "✅ Avatar is LIVE";

  } catch (error) {
    console.error(error);
    avatarStatus.textContent = "Failed: " + error.message;
    avatarStatus.style.color = "red";
  }
}

// Button click
if (startBtn) {
  startBtn.addEventListener("click", startAvatar);
}

// ====================== FLOATING CHATBOT (OpenAI) ======================
document.addEventListener("DOMContentLoaded", () => {
  const floatingBtn = document.getElementById("floatingChatBtn");

  if (!floatingBtn) {
    console.warn("Floating chat button not found in DOM");
    return;
  }

  floatingBtn.addEventListener("click", () => {
    const popup = window.open("", "AI_Assistant", "width=440,height=720,resizable=yes,scrollbars=yes");

    if (popup) {
      popup.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>AI Assistant</title>
          <style>
            body { margin:0; font-family:Inter,sans-serif; background:#0f172a; color:white; height:100vh; display:flex; flex-direction:column; }
            #chatBox { flex:1; overflow-y:auto; padding:20px; background:#1e2937; }
            .message { margin:12px 0; padding:14px 18px; border-radius:18px; max-width:85%; line-height:1.5; }
            .user { background:#3b82f6; margin-left:auto; text-align:right; }
            .assistant { background:#334155; }
            form { padding:15px; background:#1e2937; display:flex; gap:10px; }
            input { flex:1; padding:16px; border-radius:12px; border:none; background:#475569; color:white; font-size:16px; }
            button { padding:16px 24px; background:#22d3ee; color:black; border:none; border-radius:12px; font-weight:600; }
          </style>
        </head>
        <body>
          <div id="chatBox"></div>
          <form id="chatForm">
            <input id="input" type="text" placeholder="Ask anything..." autocomplete="off" />
            <button type="submit">Send</button>
          </form>

          <script>
            const chatBox = document.getElementById("chatBox");
            const form = document.getElementById("chatForm");
            const input = document.getElementById("input");

            form.addEventListener("submit", async (e) => {
              e.preventDefault();
              const msg = input.value.trim();
              if (!msg) return;

              // Show user message
              const userMsg = document.createElement("div");
              userMsg.className = "message user";
              userMsg.textContent = msg;
              chatBox.appendChild(userMsg);
              chatBox.scrollTop = chatBox.scrollHeight;

              input.value = "";

              // Call backend with correct format
              try {
                const res = await fetch("https://virtual-avatar-backend.onrender.com/api/chat", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ 
                    message: msg,
                    history: [] 
                  })
                });

                if (!res.ok) throw new Error("Bad response");

                const data = await res.json();
                const reply = data.reply || "Sorry, I couldn't respond.";

                const botMsg = document.createElement("div");
                botMsg.className = "message assistant";
                botMsg.textContent = reply;
                chatBox.appendChild(botMsg);
                chatBox.scrollTop = chatBox.scrollHeight;
              } catch (err) {
                console.error(err);
                const errorMsg = document.createElement("div");
                errorMsg.className = "message assistant";
                errorMsg.textContent = "Sorry, the AI is not responding right now.";
                chatBox.appendChild(errorMsg);
              }
            });
          </script>
        </body>
        </html>
      `);
      popup.document.close();
    }
  });
});