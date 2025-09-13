// js/chatbot.js
const API_BASE = "http://127.0.0.1:5001";

async function sendMessage() {
  const inputEl = document.getElementById("chat-input");
  const message = inputEl.value.trim();
  if (!message) return;

  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML += `<div class="user-message"><b>You:</b> ${escapeHtml(message)}</div>`;
  inputEl.value = "";

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    chatBox.innerHTML += `<div class="bot-message"><b>Bot:</b> ${escapeHtml(data.reply)}</div>`;
  } catch (err) {
    chatBox.innerHTML += `<div class="bot-message" style="color:red;"><b>Bot:</b> Error connecting to server</div>`;
  }
  chatBox.scrollTop = chatBox.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}
document.getElementById("chat-toggle").addEventListener("click", () => {
  const chatbot = document.getElementById("chatbot");
  chatbot.style.display = chatbot.style.display === "none" ? "flex" : "none";
});