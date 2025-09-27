const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCountElement = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greetingElement = document.getElementById("greeting");

let count = 0;
const maxCount = 50;

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;

  // Prevent empty submissions
  if (!name || !team) {
    return;
  }

  // Increment total count
  count++;

  // Update attendee count display
  attendeeCountElement.textContent = count;

  // Update progress bar
  const percentage = (count / maxCount) * 100;
  progressBar.style.width = percentage + "%";

  // Update team counter
  const teamCounter = document.getElementById(team + "Count");
  teamCounter.textContent = parseInt(teamCounter.textContent) + 1;

  // Show welcome message
  const msg = `Welcome, ${name} from ${teamName}!`;
  greetingElement.textContent = msg;
  greetingElement.style.display = "block";
  greetingElement.className = "success-message";

  // Auto-hide greeting after 4 seconds
  setTimeout(() => {
    greetingElement.style.display = "none";
  }, 4000);

  // Reset form
  form.reset();

  // Optional: Check if event is at capacity
  if (count >= maxCount) {
    alert("Event is now at full capacity!");
    form.style.display = "none"; // Hide form when full
  }
});
