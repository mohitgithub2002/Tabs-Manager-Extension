// popup.js

// ----- TAB MANAGEMENT FUNCTIONS -----

// Render a list of tabs in the #tabList container.
function renderTabs(tabs) {
    const tabList = document.getElementById("tabList");
    tabList.innerHTML = "";
    tabs.forEach((tab) => {
      const div = document.createElement("div");
      div.className = "tab-item";
      div.textContent = tab.title || tab.url;
      // When clicked, activate the corresponding tab.
      div.addEventListener("click", () => {
        chrome.tabs.update(tab.id, { active: true });
        chrome.windows.update(tab.windowId, { focused: true });
      });
      tabList.appendChild(div);
    });
  }
  
  // Load and render all open tabs in the current window.
  function loadTabs() {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      renderTabs(tabs);
    });
  }
  
  // ----- SESSION MANAGEMENT -----
  
  // Save the current session (list of tabs) to chrome.storage.
  document.getElementById("saveSession").addEventListener("click", () => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const session = tabs.map((tab) => ({
        url: tab.url,
        title: tab.title
      }));
      chrome.storage.local.set({ savedSession: session }, () => {
        alert("Session saved!");
      });
    });
  });
  
  // Restore the saved session by opening each stored tab.
  document.getElementById("restoreSession").addEventListener("click", () => {
    chrome.storage.local.get("savedSession", (data) => {
      const session = data.savedSession || [];
      session.forEach((tabData) => {
        chrome.tabs.create({ url: tabData.url });
      });
    });
  });
  
  // ----- TAB GROUPING -----
  
  // Group all open tabs using the chrome.tabs.group API.
  document.getElementById("groupTabs").addEventListener("click", () => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const tabIds = tabs.map((tab) => tab.id);
      chrome.tabs.group({ tabIds: tabIds }, (groupId) => {
        // Optionally update the group title.
        chrome.tabGroups.update(groupId, { title: "Grouped Tabs" });
        alert("Tabs grouped!");
      });
    });
  });
  
  // ----- SEARCH FUNCTIONALITY -----
  
  // Filter and display tabs based on the search query.
  document.getElementById("searchInput").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const filtered = tabs.filter((tab) =>
        (tab.title && tab.title.toLowerCase().includes(query)) ||
        (tab.url && tab.url.toLowerCase().includes(query))
      );
      renderTabs(filtered);
    });
  });
  
  // ----- CUSTOM SHORTCUTS -----
  
  // Render the list of custom shortcuts.
  function renderShortcuts(shortcuts) {
    const shortcutList = document.getElementById("shortcutList");
    shortcutList.innerHTML = "";
    shortcuts.forEach((shortcut) => {
      const div = document.createElement("div");
      div.className = "shortcut-item";
      div.textContent = shortcut.name;
      div.addEventListener("click", () => {
        chrome.tabs.create({ url: shortcut.url });
      });
      shortcutList.appendChild(div);
    });
  }
  
  // Load shortcuts from chrome.storage.
  function loadShortcuts() {
    chrome.storage.local.get("shortcuts", (data) => {
      const shortcuts = data.shortcuts || [];
      renderShortcuts(shortcuts);
    });
  }
  
  // Add a new shortcut from input fields.
  document.getElementById("addShortcut").addEventListener("click", () => {
    const nameInput = document.getElementById("shortcutName");
    const urlInput = document.getElementById("shortcutURL");
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    if (name && url) {
      chrome.storage.local.get("shortcuts", (data) => {
        const shortcuts = data.shortcuts || [];
        shortcuts.push({ name, url });
        chrome.storage.local.set({ shortcuts: shortcuts }, () => {
          renderShortcuts(shortcuts);
          nameInput.value = "";
          urlInput.value = "";
        });
      });
    } else {
      alert("Please enter both a name and a URL for the shortcut.");
    }
  });
  
  // ----- INITIALIZE THE POPUP -----
  
  // When the popup is loaded, display the current tabs and any saved shortcuts.
  document.addEventListener("DOMContentLoaded", () => {
    loadTabs();
    loadShortcuts();
  });
  