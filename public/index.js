<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Virtual Avatar - AI Humans for Business</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    * { 
      box-sizing: border-box; 
    }
    
    /* ... rest of your CSS ... */
  </style>

  <!-- ✅ LEAD FORM SCRIPT - Put this AFTER the </style> and before </head> or at the bottom of <body> -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      
      const form = document.getElementById('leadForm');
      const statusEl = document.getElementById('leadStatus');

      if (!form) {
        console.error("Lead form not found! Check the form ID.");
        return;
      }

      form.addEventListener('submit', async function(e) {
        e.preventDefault();

        statusEl.textContent = "Submitting...";
        statusEl.style.color = "#666";

        const formData = {
          name: document.getElementById('leadName').value.trim(),
          email: document.getElementById('leadEmail').value.trim(),
          business: document.getElementById('leadBusiness').value.trim(),
          note: document.getElementById('leadNote').value.trim()
        };

        if (!formData.name || !formData.email) {
          statusEl.textContent = "❌ Please fill in Name and Email";
          statusEl.style.color = "#ff6b6b";
          return;
        }

        try {
          const response = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });

          const result = await response.json();

          if (response.ok && result.success) {
            statusEl.textContent = "✅ Thank you! We'll contact you soon.";
            statusEl.style.color = "#00ff9d";
            form.reset();
          } else {
            throw new Error(result.message || "Server error");
          }
        } catch (err) {
          console.error("Submit error:", err);
          statusEl.textContent = "❌ Could not submit. Please try again or email us directly.";
          statusEl.style.color = "#ff6b6b";
        }
      });
    });
  </script>
    body {
      margin: 0;
      font-family: 'Inter', sans-serif;
      background: #0b0f19;
      color: #ffffff;
      text-align: center;
      padding-top: 60px;
      padding-bottom: 120px;
    }
    h1 { font-size: 52px; margin: 20px 0 12px; font-weight: 700; }
    .subtitle { font-size: 19px; color: #a9b3c7; max-width: 720px; margin: 0 auto 50px; line-height: 1.6; }

    #avatarContainer {
      width: 100%;
      max-width: 860px;
      height: 640px;
      background: #000;
      margin: 40px auto;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    }

    .avatar-controls {
      max-width: 860px;
      margin: 20px auto 70px;
      display: flex;
      gap: 12px;
      padding: 0 20px;
    }
    .avatar-controls input {
      flex: 1;
      padding: 18px;
      font-size: 17px;
      background: #121826;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      color: white;
    }
    .avatar-controls button {
      padding: 18px 28px;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    #avatarSendBtn { background: #00ff9d; color: #081018; }
    #avatarMicBtn { background: #ff3366; color: white; font-size: 26px; }

    /* Floating Chatbot */
    #floatingChatBtn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 68px;
      height: 68px;
      background: linear-gradient(135deg, #00ff9d, #0099ff);
      color: #081018;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      box-shadow: 0 10px 40px rgba(0,255,157,0.5);
      cursor: pointer;
      z-index: 1000;
    }

    .lead-section {
      max-width: 800px;
      margin: 100px auto 80px;
      background: rgba(18,24,38,0.95);
      padding: 50px 40px;
      border-radius: 24px;
    }

    .video-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 30px;
      padding: 0 20px;
    }
  </style>
</head>
<body>

  <h1>Virtual Avatar</h1>
  <p class="subtitle">Real-time AI Humans that speak, engage, and convert for your business.</p>

  <!-- LIVE AVATAR - HERO -->
  <div id="avatarContainer"></div>

  <!-- Talk to Avatar -->
  <div class="avatar-controls">
    <input id="avatarInput" type="text" placeholder="Talk to the avatar..." />
    <button id="avatarSendBtn">Send</button>
    <button id="avatarMicBtn">🎤</button>
  </div>

 <button id="startAvatarBtn" style="padding: 16px 44px; font-size: 18px; font-weight: 600; background: #00ff9d; color: #081018; border: none; border-radius: 12px; cursor: pointer;">
  Start Your Live Avatar
</button>

  <!-- Floating AI Chatbot -->
  <div id="floatingChatBtn">💬</div>

  <!-- Lead Capture -->
  <div class="lead-section">
    <h2>Ready to get your own AI Avatar?</h2>
    <p style="color:#a9b3c7; margin-bottom: 30px;">Tell us about your business and we'll create a custom demo for you.</p>
    
    <form id="leadForm">
      <input id="leadName" type="text" placeholder="Your Name" style="width:100%; padding:14px; margin:10px 0; border-radius:8px;" />
      <input id="leadEmail" type="email" placeholder="Email Address" style="width:100%; padding:14px; margin:10px 0; border-radius:8px;" />
      <input id="leadBusiness" type="text" placeholder="Business Name" style="width:100%; padding:14px; margin:10px 0; border-radius:8px;" />
      <textarea id="leadNote" placeholder="Tell us about your project" style="width:100%; padding:14px; margin:10px 0; border-radius:8px; height:120px;"></textarea>
      <button type="submit" style="padding:16px 40px; background:#00ff9d; color:black; border:none; border-radius:12px; margin-top:15px;">Request Demo</button>
    </form>
    <p id="leadStatus"></p>
  </div>

 
    <!-- Industry Demo Videos -->
<h2 style="margin: 80px 0 30px; font-size: 38px; text-align: center;">Industry Avatar Showcase</h2>

<div class="video-grid">
  
  <!-- YouTube Placeholder (keep or replace as needed) -->

  <!-- Dreaming of Africa - Vimeo (New) -->
  <div>
    <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.15);">
      <iframe 
        src="https://player.vimeo.com/video/1165938527?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" 
        frameborder="0" 
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
        referrerpolicy="strict-origin-when-cross-origin" 
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
        title="Dreaming of Africa">
      </iframe>
    </div>
    <h3>Dreaming of Africa</h3>
    <p style="margin-top: 8px; font-size: 15px; color: #666;">Live Avatar Experience</p>
  </div>

</div>

<script src="https://player.vimeo.com/api/player.js"></script>
    <div>
      <iframe width="100%" height="240" src="https://www.youtube.com/embed/YOUR_VIDEO_ID_2" frameborder="0" allowfullscreen></iframe>
      <h3>Real Estate Avatar</h3>
    </div>
    <div>
      <iframe width="100%" height="240" src="https://www.youtube.com/embed/YOUR_VIDEO_ID_3" frameborder="0" allowfullscreen></iframe>
      <h3>Business Consultant Avatar</h3>
    </div>
  </div>

  <script type="module" src="/src/main.js"></script>
</body>
</html>