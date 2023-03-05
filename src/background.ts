(() => {
  class MiterasKintaiHelperBackend {
    readonly contextMenuId = "miteras-kintai-helper-context-menu-id";
    readonly messageName = "miteras-kintai-helper-message";

    constructor() {
      chrome.contextMenus.create(
        {
          id: this.contextMenuId,
          title: chrome.i18n.getMessage("extName"),
          contexts: ["all"],
          documentUrlPatterns: ["https://kintai.miteras.jp/*/work-condition"],
        },
        () => {
          if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError);
          }
        }
      );

      // Fired when a context menu item is clicked.
      chrome.contextMenus.onClicked.addListener(
        (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
          // console.log('context menu clicked');
          // console.log(info);
          // console.log(tab);
          if (tab == null || tab.id == null || tab.id < 0) {
            return;
          }
          if (info.menuItemId === this.contextMenuId) {
            chrome.tabs.sendMessage(
              tab.id,
              {
                message: this.messageName,
              },
              (response) => {
                if (chrome.runtime.lastError) {
                  console.log(chrome.runtime.lastError);
                  return;
                }
                if (response != null && response.message === "success") {
                  // console.log("contextMenu is succeeded.");
                }
              }
            );
            return true;
          }
        }
      );
    }
  }
  new MiterasKintaiHelperBackend();
})();
