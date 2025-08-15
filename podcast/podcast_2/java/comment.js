// === CONFIG ===
const SCRIPT_URL = "YOUR_SCRIPT_URL_HERE"; // <-- paste your Apps Script Web App URL

// === ELEMENTS ===
const form = document.querySelector(".comment-form");
const list = document.getElementById("comment-list");

// Escape HTML to avoid XSS when rendering user content
function escapeHTML(str) {
  return (str || "").replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

// Build a map: parentId -> replies[]
function groupByParent(comments) {
  const byParent = {};
  comments.forEach(c => {
    const key = c.parentId || '';
    (byParent[key] ||= []).push(c);
  });
  return byParent;
}

function renderComment(c, repliesMap) {
  const replies = (repliesMap[c.id] || []).sort((a,b) => b.timestamp - a.timestamp);
  return `
    <div class="comment-item" data-id="${c.id}">
      <p class="comment-meta"><strong>${escapeHTML(c.name)}</strong> • ${new Date(c.timestamp).toLocaleString()}</p>
      <p class="comment-text">${escapeHTML(c.text)}</p>
      <button class="reply-btn" data-id="${c.id}">Reply</button>
      <div class="replies" id="replies-${c.id}">
        ${replies.map(r => `
          <div class="reply-item" data-id="${r.id}">
            <p class="comment-meta"><strong>${escapeHTML(r.name)}</strong> • ${new Date(r.timestamp).toLocaleString()}</p>
            <p class="comment-text">${escapeHTML(r.text)}</p>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

async function loadComments() {
  list.innerHTML = "<p>Loading comments…</p>";
  try {
    const res = await fetch(SCRIPT_URL);
    const data = await res.json();

    // Sort newest-first globally
    data.sort((a, b) => b.timestamp - a.timestamp);

    // Group replies under parents
    const byParent = groupByParent(data);
    const parents = (byParent[''] || []).sort((a,b) => b.timestamp - a.timestamp);

    list.innerHTML = parents.map(p => renderComment(p, byParent)).join("");
  } catch (err) {
    console.error(err);
    list.innerHTML = "<p>Failed to load comments.</p>";
  }
}

// Submit top-level comment
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const text = form.comment.value.trim();
  if (!name || !email || !text) return;

  // Clear immediately for snappy UX
  form.comment.value = "";
  form.name.value = "";
  form.email.value = "";

  try {
    // No custom headers -> avoids CORS preflight; we don't need to read the response
    await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ name, email, text }) 
    });
    loadComments();
  } catch (err) {
    console.error("Post failed:", err);
  }
});

// Reply UI + submit
document.addEventListener("click", (e) => {
  // Open a reply box
  if (e.target.matches(".reply-btn")) {
    const parentId = e.target.dataset.id;
    const already = document.getElementById(`replybox-${parentId}`);
    if (already) { already.querySelector("textarea").focus(); return; }

    const box = document.createElement("div");
    box.className = "reply-box";
    box.id = `replybox-${parentId}`;
    box.innerHTML = `
      <textarea class="reply-text" rows="3" placeholder="Write a reply…"></textarea>
      <input class="reply-name" type="text" placeholder="Your name">
      <input class="reply-email" type="email" placeholder="Your email">
      <button class="send-reply" data-parent="${parentId}">Publish reply</button>
    `;
    e.target.insertAdjacentElement("afterend", box);
  }

  // Submit the reply
  if (e.target.matches(".send-reply")) {
    const parentId = e.target.dataset.parent;
    const box = e.target.closest(".reply-box");
    const text = box.querySelector(".reply-text").value.trim();
    const name = box.querySelector(".reply-name").value.trim();
    const email = box.querySelector(".reply-email").value.trim();
    if (!name || !email || !text) return;

    // Clear fast, then send
    box.remove();
    fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ name, email, text, parentId })
    })
    .then(() => loadComments())
    .catch(err => console.error("Reply failed:", err));
  }
});

// Load on page ready
loadComments();