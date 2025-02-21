// background.js

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
  