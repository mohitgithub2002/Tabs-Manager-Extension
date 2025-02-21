// popup.js

// ----- TAB MANAGEMENT FUNCTIONS -----

function renderTabs(tabs) {
  const tabList = document.getElementById("tabList");
  tabList.innerHTML = "";
  tabs.forEach((tab) => {
    const div = document.createElement("div");
    div.className = "tab-item";
    div.textContent = tab.title || tab.url;
    div.addEventListener("click", () => {
      chrome.tabs.update(tab.id, { active: true });
      chrome.windows.update(tab.windowId, { focused: true });
    });
    tabList.appendChild(div);
  });
}

function loadTabs() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    renderTabs(tabs);
  });
}

// Add this at the top with other functions

function renderCollections() {
  chrome.storage.local.get("collections", (data) => {
    const collections = data.collections || [];
    const collectionsList = document.getElementById("collectionsList");
    collectionsList.innerHTML = "";
    
    collections.forEach(collection => {
      const div = document.createElement("div");
      div.className = "collection-item";
      div.innerHTML = `
        <span>${collection.name}</span>
        <div class="actions">
          <button class="save-tab-btn" title="Save Tab">📑</button>
          <button class="save-session-btn" title="Save Session">📚</button>
        </div>
      `;
      
      div.querySelector(".save-tab-btn").addEventListener("click", () => {
        saveTabToCollection(collection.id);
      });
      
      div.querySelector(".save-session-btn").addEventListener("click", () => {
        saveSessionToCollection(collection.id);
      });
      
      collectionsList.appendChild(div);
    });
  });
}

function saveTabToCollection(collectionId) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const session = {
      timestamp: new Date().toLocaleString(),
      tabs: [{
        url: currentTab.url,
        title: currentTab.title
      }],
      isSingleTab: true
    };
    
    saveToCollection(collectionId, session);
  });
}

function saveSessionToCollection(collectionId) {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const session = {
      timestamp: new Date().toLocaleString(),
      tabs: tabs.map(tab => ({
        url: tab.url,
        title: tab.title
      }))
    };
    
    saveToCollection(collectionId, session);
  });
}

function saveToCollection(collectionId, session) {
  chrome.storage.local.get(["collections", "sessions"], (data) => {
    const collections = data.collections || [];
    const collection = collections.find(c => c.id === collectionId) || 
                      { id: 'default', sessions: [] };
    
    collection.sessions = collection.sessions || [];
    collection.sessions.push(session);
    
    chrome.storage.local.set({ collections }, () => {
      alert("Saved to collection!");
    });
  });
}

// ----- SESSION MANAGEMENT -----

// ----- TAB GROUPING -----

// ----- VIEW SAVED SESSIONS BUTTON -----

// Add this after other event listeners

// ----- INITIALIZE THE POPUP -----

document.addEventListener("DOMContentLoaded", () => {
  // Initialize
  loadTabs();
  renderCollections();

  // Attach event listeners
  const addListener = (id, handler) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("click", handler);
    }
  };

  // Default collection buttons
  addListener("defaultSaveTab", () => saveTabToCollection("default"));
  addListener("defaultSaveSession", () => saveSessionToCollection("default"));

  // Main control buttons
  addListener("saveTab", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const session = {
        timestamp: new Date().toLocaleString(),
        tabs: [{
          url: currentTab.url,
          title: currentTab.title
        }],
        isSingleTab: true
      };
      
      chrome.storage.local.get("sessions", (data) => {
        const sessions = data.sessions || [];
        sessions.push(session);
        chrome.storage.local.set({ sessions }, () => {
          alert("Tab saved!");
        });
      });
    });
  });

  addListener("saveSession", () => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const session = {
        timestamp: new Date().toLocaleString(),
        tabs: tabs.map(tab => ({
          url: tab.url,
          title: tab.title
        }))
      };
      chrome.storage.local.get("sessions", (data) => {
        const sessions = data.sessions || [];
        sessions.push(session);
        chrome.storage.local.set({ sessions }, () => {
          alert("Session saved!");
        });
      });
    });
  });

  addListener("restoreSession", () => {
    chrome.storage.local.get("sessions", (data) => {
      const sessions = data.sessions || [];
      if (sessions.length === 0) {
        alert("No saved sessions found.");
        return;
      }
      const lastSession = sessions[sessions.length - 1];
      lastSession.tabs.forEach((tabData) => {
        chrome.tabs.create({ url: tabData.url });
      });
    });
  });

  addListener("groupTabs", () => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const tabIds = tabs.map((tab) => tab.id);
      chrome.tabs.group({ tabIds: tabIds }, (groupId) => {
        chrome.tabGroups.update(groupId, { title: "Grouped Tabs" });
        alert("Tabs grouped!");
      });
    });
  });

  addListener("viewSessions", () => {
    window.open("sessions.html");
  });

  addListener("newCollectionBtn", () => {
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
          renderCollections();
        });
      });
    }
  });
});
