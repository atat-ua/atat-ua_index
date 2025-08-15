const commentForm = document.querySelector(".comment-form");
const commentList = document.getElementById("comment-list");

// URL of your Google Apps Script deployment
const SCRIPT_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";

// Fetch and display comments
async function loadComments() {
  commentList.innerHTML = "<p>Loading comments...</p>";
  try {
    const res = await fetch(SCRIPT_URL);
    const comments = await res.json();

    // Sort newest first
    comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Render comments
    commentList.innerHTML = comments.map(comment => `
      <div class="comment-item">
        <p><strong>${comment.name}</strong> • ${new Date(comment.timestamp).toLocaleString()}</p>
        <p>${comment.text}</p>
        <button class="reply-btn" data-id="${comment.id}">Reply</button>
        ${comment.isAdmin ? `<button class="delete-btn" data-id="${comment.id}">Delete</button>` : ""}
        <div class="replies">
          ${(comment.replies || []).map(reply => `
            <div class="reply-item">
              <p><strong>${reply.name}</strong> • ${new Date(reply.timestamp).toLocaleString()}</p>
              <p>${reply.text}</p>
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");
  } catch (err) {
    commentList.innerHTML = "<p>Failed to load comments.</p>";
    console.error(err);
  }
}

// Handle comment submission
commentForm.addEventListener("submit", async e => {
  e.preventDefault();

  const name = commentForm.name.value.trim();
  const email = commentForm.email.value.trim();
  const text = commentForm.comment.value.trim();

  if (!name || !email || !text) return;

  // Clear form instantly
  commentForm.comment.value = "";
  commentForm.name.value = "";
  commentForm.email.value = "";

  // Send to backend
  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ name, email, text }),
      headers: { "Content-Type": "application/json" }
    });
    loadComments();
  } catch (err) {
    console.error("Error posting comment:", err);
  }
});

// Initial load
loadComments();
