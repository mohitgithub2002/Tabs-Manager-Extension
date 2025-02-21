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

// Add tab event listeners
chrome.tabs.onCreated.addListener((tab) => {
    console.log("Tab created:", tab);
    // You can add additional logic here to update sessions automatically.
  });
  
  chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    console.log("Tab removed:", tabId, removeInfo);
    // Update saved session if needed.
  });
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
      console.log("Tab updated:", tab);
    }
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
