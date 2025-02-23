const API_BASE_URL = 'https://tabs.revenuelogy.com/api';

// Helper functions
async function checkAuthentication() {
  const data = await chrome.storage.local.get('data');
  return data && Object.keys(data).length > 0;
}

async function getUserId() {
  const data = await chrome.storage.local.get('data');
  return data?.data?.['user-id'];
}

function redirectToAuth() {
  chrome.tabs.update({
    url: 'https://tabs.revenuelogy.com/auth/signin',
    active: true
  });
}

// Event Listeners
chrome.runtime.onStartup.addListener(async () => {
  const isAuthenticated = await checkAuthentication();
  if (!isAuthenticated) {
    redirectToAuth();
  }
});

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
    return true;
  }
});