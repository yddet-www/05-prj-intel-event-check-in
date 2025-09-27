const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCountElement = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greetingElement = document.getElementById("greeting");

const maxCount = 50;
const STORAGE_KEY = "intel_summit_attendance";

// Initialize data from localStorage or defaults
let attendanceData = loadFromStorage();
let count = attendanceData.count;
let teamCounts = attendanceData.teamCounts;
let attendeeList = attendanceData.attendeeList;

// Load data from localStorage
function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error);
  }

  // Return default data if nothing stored or error occurred
  return {
    count: 0,
    teamCounts: { water: 0, zero: 0, power: 0 },
    attendeeList: [],
  };
}

// Save data to localStorage
function saveToStorage() {
  try {
    const dataToStore = {
      count: count,
      teamCounts: teamCounts,
      attendeeList: attendeeList,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    console.log("Data saved to localStorage");
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    // Handle quota exceeded or other localStorage errors
    if (error.name === "QuotaExceededError") {
      alert("Storage quota exceeded. Some data may not be saved.");
    }
  }
}

// Clear all stored data (useful for testing or reset)
function clearStoredData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("Stored data cleared");
  } catch (error) {
    console.error("Error clearing stored data:", error);
  }
}

// Initialize display on page load
function initializeDisplay() {
  attendeeCountElement.textContent = count;
  const percentage = (count / maxCount) * 100;
  progressBar.style.width = percentage + "%";

  // Update team counters
  document.getElementById("waterCount").textContent = teamCounts.water;
  document.getElementById("zeroCount").textContent = teamCounts.zero;
  document.getElementById("powerCount").textContent = teamCounts.power;

  // Update attendee list display
  updateAttendeeListDisplay();

  // Show restoration message if data was loaded
  if (count > 0) {
    showRestorationMessage();
  }
}

// Show message when data is restored from storage
function showRestorationMessage() {
  const restorationMsg = `Restored ${count} attendees from previous session`;
  greetingElement.textContent = restorationMsg;
  greetingElement.style.display = "block";
  greetingElement.className = "info-message";

  // Hide after 3 seconds
  setTimeout(() => {
    greetingElement.style.display = "none";
  }, 3000);
}

// Function to update the attendee list display
function updateAttendeeListDisplay() {
  let attendeeListElement = document.getElementById("attendeeList");

  // Create the attendee list section if it doesn't exist
  if (!attendeeListElement) {
    const container = document.querySelector(".container");
    const attendeeSection = document.createElement("div");
    attendeeSection.className = "attendee-list-section";
    attendeeSection.innerHTML = `
      <div class="attendee-list-header">
        <h3><i class="fas fa-list"></i> Checked-In Attendees</h3>
        <button type="button" id="clearDataBtn" class="clear-data-btn" title="Clear all data">
           Reset
        </button>
      </div>
      <div id="attendeeList" class="attendee-list"></div>
    `;
    container.appendChild(attendeeSection);
    attendeeListElement = document.getElementById("attendeeList");

    // Add clear data button functionality
    document
      .getElementById("clearDataBtn")
      .addEventListener("click", handleClearData);
  }

  // Clear and rebuild the list
  attendeeListElement.innerHTML = "";

  if (attendeeList.length === 0) {
    attendeeListElement.innerHTML =
      '<div class="no-attendees">No attendees checked in yet</div>';
    return;
  }

  // Group attendees by team
  const groupedAttendees = {
    water: attendeeList.filter((a) => a.team === "water"),
    zero: attendeeList.filter((a) => a.team === "zero"),
    power: attendeeList.filter((a) => a.team === "power"),
  };

  const teamLabels = {
    water: "🌊 Team Water Wise",
    zero: "🌿 Team Net Zero",
    power: "⚡ Team Renewables",
  };

  // Display each team's attendees (most recent first)
  Object.keys(groupedAttendees).forEach((teamKey) => {
    const teamAttendees = groupedAttendees[teamKey];
    if (teamAttendees.length > 0) {
      const teamSection = document.createElement("div");
      teamSection.className = `team-attendees ${teamKey}`;

      const teamHeader = document.createElement("div");
      teamHeader.className = "team-attendees-header";
      teamHeader.textContent = `${teamLabels[teamKey]} (${teamAttendees.length})`;
      teamSection.appendChild(teamHeader);

      const attendeeItems = document.createElement("div");
      attendeeItems.className = "attendee-items";

      // Show most recent attendees first
      teamAttendees.reverse().forEach((attendee, index) => {
        const attendeeItem = document.createElement("div");
        attendeeItem.className = "attendee-item";
        attendeeItem.innerHTML = `
          <span class="attendee-name">${attendee.name}</span>
          <span class="check-in-time">${attendee.time}</span>
        `;
        attendeeItems.appendChild(attendeeItem);
      });

      teamSection.appendChild(attendeeItems);
      attendeeListElement.appendChild(teamSection);
    }
  });
}

// Handle clear data button
function handleClearData() {
  if (
    confirm(
      "Are you sure you want to clear all attendance data? This cannot be undone."
    )
  ) {
    // Reset all data
    count = 0;
    teamCounts = { water: 0, zero: 0, power: 0 };
    attendeeList = [];

    // Clear from localStorage
    clearStoredData();

    // Update display
    initializeDisplay();

    // Show confirmation message
    greetingElement.textContent = "All attendance data has been cleared";
    greetingElement.style.display = "block";
    greetingElement.className = "info-message";

    setTimeout(() => {
      greetingElement.style.display = "none";
    }, 3000);
  }
}

// Form submission handler
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;

  // Prevent empty submissions
  if (!name || !team) {
    return;
  }

  // Check for duplicate names (optional feature)
  const isDuplicate = attendeeList.some(
    (attendee) => attendee.name.toLowerCase() === name.toLowerCase()
  );

  if (isDuplicate) {
    if (!confirm(`${name} is already checked in. Add anyway?`)) {
      return;
    }
  }

  // Increment total count
  count++;

  // Add attendee to list with timestamp
  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  attendeeList.push({
    name: name,
    team: team,
    teamName: teamName,
    time: timeString,
    timestamp: now.toISOString(), // Store full timestamp for sorting
  });

  // Update attendee count display
  attendeeCountElement.textContent = count;

  // Update progress bar
  const percentage = (count / maxCount) * 100;
  progressBar.style.width = percentage + "%";

  // Update team counter
  teamCounts[team]++;
  const teamCounter = document.getElementById(team + "Count");
  teamCounter.textContent = teamCounts[team];

  // Show welcome message
  const msg = `Welcome, ${name} from ${teamName}!`;
  greetingElement.textContent = msg;
  greetingElement.style.display = "block";
  greetingElement.className = "success-message";

  // Update attendee list display
  updateAttendeeListDisplay();

  // Save to localStorage after all updates
  saveToStorage();

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

// Call initialization when page loads
initializeDisplay();

// Optional: Add keyboard shortcut for clearing data (Ctrl+Shift+C)
document.addEventListener("keydown", function (event) {
  if (event.ctrlKey && event.shiftKey && event.key === "C") {
    handleClearData();
  }
});

// Optional: Warn user before closing if there's unsaved data
window.addEventListener("beforeunload", function (event) {
  // This will save any final changes
  saveToStorage();
});

// Export functions for testing (optional)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    loadFromStorage,
    saveToStorage,
    clearStoredData,
  };
}
