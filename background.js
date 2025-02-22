// background.js

// Helper function to check authentication
async function checkAuthentication() {
  const data = await chrome.storage.local.get('data');
  console.log("Auth check data:", data); // Debug log
  return data && Object.keys(data).length > 0;
}

// Helper function to redirect to auth page
function redirectToAuth() {
  chrome.tabs.update({
    url: 'http://localhost:3000/auth/signin',
    active: true
  });
}

// Modified startup handler
chrome.runtime.onStartup.addListener(async () => {
  const isAuthenticated = await checkAuthentication();
  const sessionsUrl = chrome.runtime.getURL('sessions.html');
  
  if (!isAuthenticated) {
    redirectToAuth();
  } else {
    chrome.tabs.create({
      url: sessionsUrl,
      active: true
    });
  }
});

// Modified tab event listeners
chrome.tabs.onCreated.addListener(async (tab) => {
  if (tab.pendingUrl === 'chrome://newtab/' || tab.url === 'chrome://newtab/') {
    const isAuthenticated = await checkAuthentication();
    const sessionsUrl = chrome.runtime.getURL('sessions.html');
    
    if (!isAuthenticated) {
      redirectToAuth();
    } else {
      chrome.tabs.update(tab.id, { url: sessionsUrl });
    }
  }
});

// Modified installation handler
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    redirectToAuth();
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