(() => {
  class TabManager {
    readonly filterUrl: string = "https://kintai.miteras.jp/";
    matchedTab: { [key: number]: boolean; } = {};
    isUrlMatched(url?: string): boolean {
      if (url != null && url.indexOf(this.filterUrl) >= 0) {
        return true;
      }
      return false;
    }
    updateTab(tabId: number | undefined, url: string | undefined): void {
      if (tabId == null || tabId == null || tabId < 0 || url == null) {
        return;
      }
      if (this.isUrlMatched(url)) {
        this.matchedTab[tabId] = true;
        // console.log(`Tab ${tabId} is changed to in. (url: ${url})`);
      } else {
        this.matchedTab[tabId] = false;
        // console.log(`Tab ${tabId} is changed to out. (url: ${url})`);
      }
    }
    deleteTab(tabId: number): void {
      delete this.matchedTab[tabId];
      // console.log(`Tab ${tabId} is deleted.`);
    }
    queryTab(tabId: number): boolean {
      if (this.matchedTab[tabId]) {
        // console.log(`Tab ${tabId} is in.`);
        return true;
      } else {
        // console.log(`Tab ${tabId} is out.`);
        return false;
      }
    }
  };
  class MiterasKintaiHelperBackend {
    readonly contextMenuId = "miteras-kintai-helper-context-menu-id";
    readonly messageName = "miteras-kintai-helper-message";
    tabManager: TabManager = new TabManager();
    activeTabId: number = -1;

    updateContextMenu(): void {
      if (this.activeTabId === -1) {
        return;
      }
      const tabId = this.activeTabId;
      const isMatched = this.tabManager.queryTab(tabId);
      // console.log(`updateContextMenus - ${isMatched}`);
      if (isMatched) {
        chrome.contextMenus.create(
          {
            id: this.contextMenuId,
            title: chrome.i18n.getMessage("extName"),
            contexts: ["page"]
          },
          () => {
            if (chrome.runtime.lastError) {
              // console.log(chrome.runtime.lastError);
              return;
            }
          }
        );
      }
      else {
        chrome.contextMenus.remove(this.contextMenuId, () => {
          if (chrome.runtime.lastError) {
            // console.log(chrome.runtime.lastError);
            return;
          }
        });
      }
    }

    constructor() {
      // Fired when a tab is updated.
      chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
        if (tab == null || tabId < 0) {
          return;
        }
        if (changeInfo.url != null) {
          // console.log("onUpdated: " + tab.id, JSON.stringify(changeInfo));
          this.tabManager.updateTab(tabId, changeInfo.url);
          this.updateContextMenu();
        }
        if (changeInfo.status === "complete") {
          // console.log("onUpdated: " + tab.id, JSON.stringify(changeInfo), tab.url);
          this.tabManager.updateTab(tabId, tab.url);
          this.updateContextMenu();
          if (this.tabManager.queryTab(tabId)) {
            chrome.tabs.executeScript(
              tabId, { file: "foreground.js" }
            ).then((value: any[]) => {
              if (chrome.runtime.lastError) {
                // console.log(chrome.runtime.lastError);
              }
            }).catch((reason: any) => {
              if (chrome.runtime.lastError) {
                // console.log(chrome.runtime.lastError);
              }
            })
          }
        }
      });

      // Fires when the active tab in a window changes.
      // Note that the tab's URL may not be set at the time this event fired, but you can listen to onUpdated events to be notified when a URL is set.
      chrome.tabs.onActivated.addListener((activeInfo: chrome.tabs.TabActiveInfo) => {
        if (activeInfo != null && activeInfo.tabId != null) {
          this.activeTabId = activeInfo.tabId;
          this.updateContextMenu();
        }
      });

      // Fired when a tab is created.
      // Note that the tab's URL may not be set at the time this event fired, but you can listen to onUpdated events to be notified when a URL is set.
      chrome.tabs.onCreated.addListener((tab: chrome.tabs.Tab) => {
        this.tabManager.updateTab(tab.id, tab.url);
      });

      // Fired when a tab is closed.
      chrome.tabs.onRemoved.addListener((tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => {
        this.tabManager.deleteTab(tabId);
      });

      // Fired when the currently focused window changes.
      // Will be chrome.windows.WINDOW_ID_NONE if all chrome windows have lost focus.
      chrome.windows.onFocusChanged.addListener((windowId: number) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
          if (tabs.length > 0) {
            for (const tab of tabs) {
              if (tab != null && tab.id != null && tab.id >= 0) {
                this.tabManager.updateTab(tab.id, tab.url);
              }
            }
            if (tabs[0].id != null && tabs[0].id >= 0) {
              this.activeTabId = tabs[0].id;
              this.updateContextMenu();
            }
          }
        });
      });

      // Fired when a context menu item is clicked.
      chrome.contextMenus.onClicked.addListener((info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
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
              message: this.messageName
            },
            (response) => {
              if (chrome.runtime.lastError) {
                // console.log("chrome.runtime.lastError: ", chrome.runtime.lastError);
                return;
              }
              if (response != null && response.message === "success") {
                // console.log("contextMenu is succeeded.");
              }
            }
          );
          return true;
        }
      });
    }
  };
  new MiterasKintaiHelperBackend();
})();
