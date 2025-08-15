document.getElementById("subscribe-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const form = e.target;
  const emailValue = form.email.value;

  // Clear field immediately
  form.email.value = "";

  // Show thank-you message instantly
  const messageEl = document.getElementById("subscribe-message");
  messageEl.textContent = "Thanks for subscribing!";
  messageEl.style.display = "block";
  messageEl.style.opacity = "1";
  messageEl.style.color = "green"; // reset color in case of previous error

  // Hide message after 3 seconds with fade-out
  setTimeout(() => {
    messageEl.style.transition = "opacity 0.5s ease";
    messageEl.style.opacity = "0";
    setTimeout(() => {
      messageEl.style.display = "none";
    }, 500); // wait for fade-out to finish
  }, 3000);

  // Send data to Google Sheets in background
  fetch("https://script.google.com/macros/s/AKfycbyhE3fsPz6RFvlwuorsG6KcoyZ3q8gtTkZ6yQQDpMfKcxdh32AWETQ_5qS-jJNws7oezg/exec", {
    method: "POST",
    body: JSON.stringify({ email: emailValue })
  })
  .catch(err => {
    console.error("Submission failed:", err);
    messageEl.textContent = "Oops! Something went wrong. Please try again.";
    messageEl.style.color = "red";
    messageEl.style.display = "block";
    messageEl.style.opacity = "1"; // keep visible if there's an error
  });
});

