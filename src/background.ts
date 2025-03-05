/// <reference types="npm:@types/chrome" />

import { DEFAULT_OPTIONS, LOCAL_STORAGE_KEYS } from "./constant.ts";
import { DeletionRecord } from "./interface.ts";

const UNGROUPED_LABEL = "<Null>";
const RIGHT_SIDE_TAB_INDEX = 9999;

const getGroupName = (url: string, mergeSubdomains: boolean) => {
  try {
    let hostname = new URL(url).hostname;
    if (hostname.startsWith("www.")) {
      hostname = hostname.substring(4);
    }

    if (!mergeSubdomains) {
      return hostname;
    }

    const parts = hostname.split(".");
    if (parts.length >= 2) {
      // 簡易的にセカンドレベルドメインをグループ名とする
      return parts[parts.length - 2];
    }
    return hostname;
  } catch (_) {
    return null;
  }
};

const getOptions = async () => {
  return await chrome.storage.sync.get(DEFAULT_OPTIONS);
};

const moveTabsToGroup = async (groups: Record<string, number[]>) => {
  const currentWindow = await chrome.windows.getCurrent();
  const existingGroups = await chrome.tabGroups.query({
    windowId: currentWindow.id,
  });

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

/**
 * 全てのグループをたたむ
 * 新たに作ったグループか、元々あったものかは区別しない
 */
const collapseAllGroup = async () => {
  const currentWindow = await chrome.windows.getCurrent();
  const existingGroups = await chrome.tabGroups.query({
    windowId: currentWindow.id,
  });

  for (const group of existingGroups) {
    chrome.tabGroups.update(group.id, { collapsed: true });
  }
};

/**
 * グループ化したタブを左側に寄せたいため、グループ化されていないタブを右側に移動する
 * グループ化したタブを index: 0 に移動すると、ピン留めされたタブが存在する場合にエラーになるため、グループ化されていないタブを index: 9999 に移動している
 */
const moveUngroupedTabsToRightSide = async () => {
  const tabs = await chrome.tabs.query({ currentWindow: true, pinned: false });
  const ungroupedTabs = tabs.filter((tab) => tab.groupId === -1);
  const ungroupedTabIds = ungroupedTabs.map((tab) => tab.id).filter((id) =>
    id !== undefined
  );
  if (ungroupedTabIds.length === 0) {
    return;
  }
  chrome.tabs.move(ungroupedTabIds, { index: RIGHT_SIDE_TAB_INDEX });
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
  if (options.collapseGroup) {
    await collapseAllGroup(groups);
  }
  await moveUngroupedTabsToRightSide();
};

const updateDeletionHistory = async (
  windowType: keyof typeof LOCAL_STORAGE_KEYS,
  record: DeletionRecord,
) => {
  const key = LOCAL_STORAGE_KEYS[windowType];
  const histories = await chrome.storage.local.get(key);
  const history = histories[key] || [];
  history.unshift(record);
  await chrome.storage.local.set({ [key]: history });
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

  const currentWindow = await chrome.windows.getCurrent();
  const windowType: keyof typeof LOCAL_STORAGE_KEYS = currentWindow.incognito
    ? "incognito"
    : "normal";

  // タブがタブグループに属していない場合は groupId が -1 になるっぽい
  if (activeTab.groupId === -1) {
    chrome.tabs.remove(activeTab.id);

    const deletionRecord = {
      timestamp: Date.now(),
      groupName: UNGROUPED_LABEL,
      windowType,
      tabs: [{
        url: activeTab.url ?? "",
        title: activeTab.title ?? "",
      }],
    };

    updateDeletionHistory(windowType, deletionRecord);
    return;
  }

  const groupId = activeTab.groupId;
  // 該当グループに属する全タブを取得し、削除する
  // Memo: GUIの「Delete Group」のような機能がchrome.tabGroupsに見当たらないため、タブの全削除により対応
  const groupTabs = await chrome.tabs.query({ groupId });

  const tabIds = groupTabs.map((tab) => tab.id!);
  chrome.tabs.remove(tabIds);

  // 現在のウィンドウ内のタブグループ一覧からグループ名を取得する
  const existingGroups = await chrome.tabGroups.query({
    windowId: currentWindow.id,
  });
  const existingGroup = existingGroups.find((group) => group.id === groupId);
  const groupName = existingGroup ? existingGroup.title : UNGROUPED_LABEL;

  const deletionRecord = {
    timestamp: Date.now(),
    groupName: groupName ?? UNGROUPED_LABEL,
    windowType,
    tabs: groupTabs.map((tab) => ({
      url: tab.url ?? "",
      title: tab.title ?? "",
    })),
  };

  updateDeletionHistory(windowType, deletionRecord);
};

chrome.commands.onCommand.addListener((command: string) => {
  if (command === "group-tabs") {
    groupTabsByDomain();
  }

  if (command === "delete-tab-group") {
    deleteTabGroup();
  }
});
