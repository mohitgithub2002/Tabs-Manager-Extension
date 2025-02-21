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

document.getElementById("restoreSession").addEventListener("click", () => {
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

// ----- VIEW SAVED SESSIONS BUTTON -----

document.getElementById("viewSessions").addEventListener("click", () => {
  window.open("sessions.html");
});

// ----- INITIALIZE THE POPUP -----

document.addEventListener("DOMContentLoaded", () => {
  loadTabs();
});
