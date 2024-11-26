// Listener for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Inject the content script when the page is fully loaded
  if (changeInfo.status === "complete" && /^https?:\/\//.test(tab.url)) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["content.js"]
    });
    console.log("Content script injected into:", tab.url);
  }
});
