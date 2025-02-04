/// <reference types="npm:@types/chrome" />

const getGroupName = (url: string, mergeSubdomains: boolean) => {
  try {
    let hostname = new URL(url).hostname;
    if (hostname.startsWith("www.")) {
      hostname = hostname.substring(4);
    }

    if (!mergeSubdomains) {
      return hostname.replace(/\./g, "-");
    }

    const parts = hostname.split(".");
    if (parts.length >= 2) {
      // 簡易的にセカンドレベルドメインをグループ名とする
      return parts[parts.length - 2];
    }
    return hostname;
  } catch (error) {
    console.error("Error extracting group name:", error);
    return null;
  }
};

const getOptions = async () => {
  return await chrome.storage.sync.get({
    groupPinned: false, // ピン留めタブはグループ化しない（デフォルト）
    regroupExisting: false, // 既存のグループはそのままにする（デフォルト）
    mergeSubdomains: true, // サブドメインをマージする（デフォルト）
    domainExceptions: [], // 例外ドメイン
  });
};

const moveTabsToGroup = async (groups: Record<string, number[]>) => {
  const existingGroups = await chrome.tabGroups.query({});

  for (const groupName in groups) {
    const tabIds = groups[groupName];
    // 同じタイトルのグループが既にあるかチェック
    const existingGroup = existingGroups.find((group) =>
      group.title === groupName
    );
    if (existingGroup) {
      // 既存グループへタブを追加
      chrome.tabs.group({ groupId: existingGroup.id, tabIds: tabIds });
    } else {
      // 新規グループ化し、グループタイトルを設定
      chrome.tabs.group({ tabIds: tabIds }, function (newGroupId) {
        chrome.tabGroups.update(newGroupId, {
          title: groupName,
        });
      });
    }
  }
};

const groupTabsByDomain = async () => {
  const options = await getOptions();

  const tabs = await chrome.tabs.query({ currentWindow: true });
  const groups: Record<string, number[]> = {};

  for (const tab of tabs) {
    if (!tab.url || !tab.url.startsWith("http")) continue;
    if (!options.groupPinned && tab.pinned) continue;
    if (!options.regroupExisting && tab.groupId !== -1) continue;

    const urlObj = new URL(tab.url);
    const cleanHostname = urlObj.hostname.startsWith("www.")
      ? urlObj.hostname.substring(4)
      : urlObj.hostname;

    if (
      options.domainExceptions.includes(cleanHostname) ||
      options.domainExceptions.includes(urlObj.hostname)
    ) {
      continue;
    }

    const groupName = getGroupName(tab.url, options.mergeSubdomains);
    if (!groupName) continue;

    if (!groups[groupName]) {
      groups[groupName] = [];
    }

    if (tab.id) {
      groups[groupName].push(tab.id);
    }
  }

  await moveTabsToGroup(groups);
};

const deleteTabGroup = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs.length === 0) {
    return;
  }

  const activeTab = tabs[0];
  if (!activeTab.id) {
    return;
  }

  // タブがタブグループに属していない場合は groupId が -1 になるっぽい
  if (activeTab.groupId === -1) {
    chrome.tabs.remove(activeTab.id);
    return;
  }

  const groupId = activeTab.groupId;
  // 該当グループに属する全タブを取得し、削除する
  // Memo: GUIの「Delete Group」のような機能がchrome.tabGroupsに見当たらないため、タブの全削除により対応
  const groupTabs = await chrome.tabs.query({ groupId });

  const tabIds = groupTabs.map((tab) => tab.id!);
  chrome.tabs.remove(tabIds);
};

// キーボードショートカットのイベントリスナー
chrome.commands.onCommand.addListener((command: string) => {
  if (command === "group-tabs") {
    groupTabsByDomain();
  }

  if (command === "delete-tab-group") {
    deleteTabGroup();
  }
});
