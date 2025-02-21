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
      sessionDate.textContent = session.timestamp || "Unknown Date";
  
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
  
  document.addEventListener("DOMContentLoaded", () => {
    // Load sessions from storage and render them
    chrome.storage.local.get("sessions", (data) => {
      const sessions = data.sessions || [];
      renderSessions(sessions);
    });
  });
