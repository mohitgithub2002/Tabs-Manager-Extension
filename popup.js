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

// ----- SESSION MANAGEMENT -----

// Save the current session along with the current time.
document.getElementById("saveSession").addEventListener("click", () => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const session = {
      timestamp: new Date().toLocaleString(),
      tabs: tabs.map((tab) => ({
        url: tab.url,
        title: tab.title
      }))
    };
    chrome.storage.local.get("sessions", (data) => {
      const sessions = data.sessions || [];
      sessions.push(session);
      chrome.storage.local.set({ sessions }, () => {
        alert("Session saved at " + session.timestamp);
      });
    });
  });
});

// Restore the most recently saved session.
document.getElementById("restoreSession").addEventListener("click", () => {
  chrome.storage.local.get("sessions", (data) => {
    const sessions = data.sessions || [];
    if (sessions.length === 0) {
      alert("No saved sessions found.");
      return;
    }
    // Restore the last session saved.
    const lastSession = sessions[sessions.length - 1];
    lastSession.tabs.forEach((tabData) => {
      chrome.tabs.create({ url: tabData.url });
    });
  });
});

// ----- TAB GROUPING -----

document.getElementById("groupTabs").addEventListener("click", () => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const tabIds = tabs.map((tab) => tab.id);
    chrome.tabs.group({ tabIds: tabIds }, (groupId) => {
      chrome.tabGroups.update(groupId, { title: "Grouped Tabs" });
      alert("Tabs grouped!");
    });
  });
});

// ----- SEARCH FUNCTIONALITY -----

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

function loadShortcuts() {
  chrome.storage.local.get("shortcuts", (data) => {
    const shortcuts = data.shortcuts || [];
    renderShortcuts(shortcuts);
  });
}

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

// ----- VIEW SAVED SESSIONS BUTTON -----

document.getElementById("viewSessions").addEventListener("click", () => {
  window.open("sessions.html");
});

// ----- INITIALIZE THE POPUP -----

document.addEventListener("DOMContentLoaded", () => {
  loadTabs();
  loadShortcuts();
});
