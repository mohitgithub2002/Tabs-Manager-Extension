// sessions.js

/**
 * Renders the saved sessions in a dark card-based UI
 * similar to Toby. 
 * Each session has:
 *  - A timestamp/date label
 *  - A "Restore" button (optional)
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
  
      // Create the header for this session (date/time + optional restore button)
      const sessionHeader = document.createElement("div");
      sessionHeader.className = "session-header";
  
      const sessionDate = document.createElement("div");
      sessionDate.className = "session-date";
      // Add indicator if it's a single saved tab
      sessionDate.textContent = `${session.timestamp} ${session.isSingleTab ? '(Single Tab)' : ''}`;
  
      // Add date/time to the header
      sessionHeader.appendChild(sessionDate);
  
      // Optional: add a "Restore" button to reopen all tabs in this session
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
  
      // Add the sessionHeader to the sessionGroup
      sessionGroup.appendChild(sessionHeader);
  
      // Create the container for tab cards
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
  
        // Link
        const tabLink = document.createElement("div");
        tabLink.className = "tab-link";
        tabLink.textContent = new URL(tab.url).hostname;
  
        // Append title and link to the card
        tabCard.appendChild(tabTitle);
        tabCard.appendChild(tabLink);
  
        // Make the entire card clickable
        tabCard.addEventListener("click", () => {
          chrome.tabs.create({ url: tab.url });
        });
  
        // Add hover effect to show full URL
        tabCard.setAttribute("title", tab.url);
  
        // Add the card to the container
        tabsContainer.appendChild(tabCard);
      });
  
      // Finally, add the tabsContainer to the sessionGroup
      sessionGroup.appendChild(tabsContainer);
  
      // Add the entire sessionGroup to the sessionsList container
      sessionsList.appendChild(sessionGroup);
    });
  }
  
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
    
    // Then render other collections
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

    // Set default collection as active initially
    if (!document.querySelector(".collection-item.active")) {
      defaultDiv.classList.add("active");
      renderSessions(sessions);
    }
  });
}

  document.addEventListener("DOMContentLoaded", () => {
    // Load username from storage
    chrome.storage.local.get("username", (data) => {
      if (data.username) {
        document.getElementById("displayName").textContent = data.username;
      }
    });
  
    // Load and render sessions
    chrome.storage.local.get("sessions", (data) => {
      const sessions = data.sessions || [];
      renderSessions(sessions);
    });
  
    // User name editing functionality
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

    renderCollectionsList();
  
    // Add new collection button handler
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
            location.reload();
          });
        });
      }
    });
  });
