// background.js

// Add startup handler
chrome.runtime.onStartup.addListener(() => {
  // Get the extension URL for sessions.html
  const sessionsUrl = chrome.runtime.getURL('sessions.html');
  
  // Create a new tab with sessions.html
  chrome.tabs.create({
    url: sessionsUrl,
    active: true
  });
});

// Add tab event listeners
chrome.tabs.onCreated.addListener((tab) => {
  const sessionsUrl = chrome.runtime.getURL('sessions.html');
  if (tab.pendingUrl === 'chrome://newtab/' || tab.url === 'chrome://newtab/') {
    chrome.tabs.update(tab.id, { url: sessionsUrl });
  }
  console.log("Tab created:", tab);
  // You can add additional logic here to update sessions automatically.
});

// Add installation handler
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // Initialize storage with default collection
    chrome.storage.local.set({
      collections: [{
        id: 'default',
        name: 'Default Collection',
        sessions: []
      }],
      username: 'Guest'
    }, () => {
      console.log('Storage initialized with default collection');
    });
  }
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.action === "store_token") {
    const sessionsUrl = chrome.runtime.getURL('sessions.html');
    chrome.storage.local.set({ 'data': message.data }, function() {
      console.log("Token stored successfully");
      chrome.tabs.update({ url: sessionsUrl });
      sendResponse({ status: "success" });
    });
    return true; // Indicating that the response is async
  }
});