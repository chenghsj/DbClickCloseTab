chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    chrome.scripting.executeScript({ target: { tabId: tabId }, files: ["inject.js"] }, () => chrome.runtime.lastError);
  }
});
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.closeTab) chrome.tabs.remove(sender.tab.id);
});
