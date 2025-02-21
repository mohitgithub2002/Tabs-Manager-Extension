// sessions.js

/**
 * Renders the saved sessions in a dark card-based UI.
 * Each session has:
 *  - A timestamp/date label
 *  - A "Restore" button
 *  - A grid of tab cards (title + link)
 */
function renderSessions(sessions) {
  const sessionsList = document.getElementById("sessionsList");
  sessionsList.innerHTML = "";

  // If no sessions are found, display a simple message
  if (!sessions || sessions.length === 0) {
    const noSessionsMsg = document.createElement("div");
    noSessionsMsg.textContent = "No saved sessions.";
    noSessionsMsg.style.color = "#ccc";
    sessionsList.appendChild(noSessionsMsg);
    return;
  }

  // Loop through each session object
  sessions.forEach((session) => {
    // session = { timestamp: string, tabs: [ { title, url }, ... ] }

    // Create a container for this session group
    const sessionGroup = document.createElement("div");
    sessionGroup.className = "session-group";

    // Create the header for this session (date/time + restore button)
    const sessionHeader = document.createElement("div");
    sessionHeader.className = "session-header";

    // Session date/time
    const sessionDate = document.createElement("div");
    sessionDate.className = "session-date";
    sessionDate.textContent = session.timestamp || "Unknown Date";
    sessionHeader.appendChild(sessionDate);

    // "Restore" button
    const restoreBtn = document.createElement("button");
    restoreBtn.className = "restore-btn";
    restoreBtn.textContent = "Restore";
    restoreBtn.addEventListener("click", () => {
      // Re-open all tabs from this session
      session.tabs.forEach((tabData) => {
        chrome.tabs.create({ url: tabData.url });
      });
    });
    sessionHeader.appendChild(restoreBtn);

    // Add the header to the session group
    sessionGroup.appendChild(sessionHeader);

    // Create container for the tab cards
    const tabsContainer = document.createElement("div");
    tabsContainer.className = "tabs-container";

    // For each tab in the session, create a card
    session.tabs.forEach((tab) => {
      const tabCard = document.createElement("div");
      tabCard.className = "tab-card";

      // Title
      const tabTitle = document.createElement("div");
      tabTitle.className = "tab-title";
      tabTitle.textContent = tab.title || "Untitled";

      // Link (show hostname or partial URL)
      const tabLink = document.createElement("div");
      tabLink.className = "tab-link";

      try {
        // Attempt to show just the hostname
        tabLink.textContent = new URL(tab.url).hostname;
      } catch {
        // Fallback if URL parsing fails
        tabLink.textContent = tab.url;
      }

      // Append title and link
      tabCard.appendChild(tabTitle);
      tabCard.appendChild(tabLink);

      // Make the entire card clickable to open the tab
      tabCard.addEventListener("click", () => {
        chrome.tabs.create({ url: tab.url });
      });

      // Hover tooltip to show the full URL
      tabCard.title = tab.url;

      // Add the card to tabsContainer
      tabsContainer.appendChild(tabCard);
    });

    // Append tabsContainer to the session group
    sessionGroup.appendChild(tabsContainer);

    // Finally, add the session group to the sessionsList
    sessionsList.appendChild(sessionGroup);
  });
}

/**
 * Renders the collections list in the sidebar
 */
function renderCollectionsList() {
  chrome.storage.local.get(["collections", "sessions"], (data) => {
    const collections = data.collections || [];
    const sessions = data.sessions || [];
    const sidebarCollections = document.getElementById("sidebarCollections");
    
    // Clear existing content
    sidebarCollections.innerHTML = "";
    
    // Add default collection first
    const defaultDiv = document.createElement("div");
    defaultDiv.className = "collection-item";
    defaultDiv.dataset.id = "default";
    defaultDiv.textContent = "Default Collection";
    
    defaultDiv.addEventListener("click", () => {
      document.querySelectorAll(".collection-item").forEach(item => {
        item.classList.remove("active");
      });
      defaultDiv.classList.add("active");
      renderSessions(sessions); // Render default sessions
    });
    
    sidebarCollections.appendChild(defaultDiv);
    
    // Render other collections
    collections.forEach(collection => {
      const div = document.createElement("div");
      div.className = "collection-item";
      div.textContent = collection.name;
      div.dataset.id = collection.id;
      
      div.addEventListener("click", () => {
        document.querySelectorAll(".collection-item").forEach(item => {
          item.classList.remove("active");
        });
        div.classList.add("active");
        renderSessions(collection.sessions || []);
      });
      
      sidebarCollections.appendChild(div);
    });

    // Activate default collection if none are active
    if (!document.querySelector(".collection-item.active")) {
      defaultDiv.classList.add("active");
      renderSessions(sessions);
    }
  });
}

// On DOM load, fetch user name, sessions, and collections
document.addEventListener("DOMContentLoaded", () => {
  // Load username from storage
  chrome.storage.local.get("username", (data) => {
    if (data.username) {
      document.getElementById("displayName").textContent = data.username;
    }
  });

  // Render the main sessions list (for default collection)
  chrome.storage.local.get("sessions", (data) => {
    const sessions = data.sessions || [];
    renderSessions(sessions);
  });

  // Name editing functionality
  const editNameBtn = document.getElementById("editNameBtn");
  const nameEditContainer = document.getElementById("nameEditContainer");
  const nameInput = document.getElementById("nameInput");
  const saveNameBtn = document.getElementById("saveNameBtn");
  const displayName = document.getElementById("displayName");

  editNameBtn.addEventListener("click", () => {
    nameEditContainer.classList.remove("hidden");
    nameInput.value = displayName.textContent;
    nameInput.focus();
  });

  saveNameBtn.addEventListener("click", () => {
    const newName = nameInput.value.trim();
    if (newName) {
      displayName.textContent = newName;
      chrome.storage.local.set({ username: newName });
      nameEditContainer.classList.add("hidden");
    }
  });

  nameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      saveNameBtn.click();
    }
  });

  // Render the collections in the sidebar
  renderCollectionsList();

  // Handle "New Collection" button
  document.getElementById("newCollectionBtn").addEventListener("click", () => {
    const name = prompt("Enter collection name:");
    if (name) {
      chrome.storage.local.get("collections", (data) => {
        const collections = data.collections || [];
        collections.push({
          id: Date.now().toString(),
          name,
          sessions: []
        });
        chrome.storage.local.set({ collections }, () => {
          // Reload to refresh sidebar
          location.reload();
        });
      });
    }
  });
});
