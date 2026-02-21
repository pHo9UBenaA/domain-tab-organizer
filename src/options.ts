/// <reference types="npm:@types/chrome" />

import { DEFAULT_OPTIONS } from "./constant.ts";
import { DeletionRecord } from "./interface.ts";

const groupPinnedElement = <HTMLInputElement> document.getElementById(
  "groupPinned",
);

const regroupExistingElement = <HTMLInputElement> document.getElementById(
  "regroupExisting",
);

const mergeSubdomainsElement = <HTMLInputElement> document.getElementById(
  "mergeSubdomains",
);

const collapseGroupElement = <HTMLInputElement> document.getElementById(
  "collapseGroup",
);

const domainExceptionsElement = <HTMLTextAreaElement> document.getElementById(
  "domainExceptions",
);

document.addEventListener("DOMContentLoaded", async () => {
  const data = await chrome.storage.sync.get(DEFAULT_OPTIONS);

  if (groupPinnedElement) {
    groupPinnedElement.checked = data.groupPinned;
  }

  if (regroupExistingElement) {
    regroupExistingElement.checked = data.regroupExisting;
  }

  if (mergeSubdomainsElement) {
    mergeSubdomainsElement.checked = data.mergeSubdomains;
  }

  if (collapseGroupElement) {
    collapseGroupElement.checked = data.collapseGroup;
  }

  if (domainExceptionsElement) {
    domainExceptionsElement.value = Array.isArray(data.domainExceptions)
      ? data.domainExceptions.join(", ")
      : data.domainExceptions;
  }

  const histories = await chrome.storage.local.get([
    "deletionHistory_normal",
    "deletionHistory_incognito",
  ]);

  const normalHistory = histories.deletionHistory_normal || [];
  const incognitoHistory = histories.deletionHistory_incognito || [];
  const normalHistoryContainer = <HTMLUListElement> document.getElementById(
    "normalHistory",
  );
  const incognitoHistoryContainer = <HTMLUListElement> document.getElementById(
    "incognitoHistory",
  );

  const renderHistory = (
    history: DeletionRecord[],
    container: HTMLUListElement,
  ) => {
    container.innerHTML = "";

    for (const record of history) {
      const groupLi = document.createElement("li");
      const date = new Date(record.timestamp).toLocaleString();
      groupLi.textContent = `Group: ${record.groupName} (${date})`;

      const tabsUl = document.createElement("ul");

      for (const tab of record.tabs) {
        const tabLi = document.createElement("li");
        const link = document.createElement("a");
        link.href = tab.url;
        link.target = "_blank";
        link.textContent = tab.title;
        tabLi.appendChild(link);
        tabsUl.appendChild(tabLi);
      }

      groupLi.appendChild(tabsUl);
      container.appendChild(groupLi);
    }
  };

  if (normalHistoryContainer) {
    renderHistory(normalHistory, normalHistoryContainer);
  }

  if (incognitoHistoryContainer) {
    renderHistory(incognitoHistory, incognitoHistoryContainer);
  }

  const clearHistoryBtn = <HTMLButtonElement> document.getElementById(
    "clearHistoryBtn",
  );

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", async () => {
      await chrome.storage.local.remove([
        "deletionHistory_normal",
        "deletionHistory_incognito",
      ]);

      if (normalHistoryContainer) {
        normalHistoryContainer.innerHTML = "";
      }
      if (incognitoHistoryContainer) {
        incognitoHistoryContainer.innerHTML = "";
      }

      const clearStatus = <HTMLParagraphElement> document.getElementById(
        "clear-status",
      );
      clearStatus.textContent = "Deletion history cleared.";
      setTimeout(() => clearStatus.textContent = "", 2000);
    });
  }
});

document.getElementById("optionsForm")?.addEventListener(
  "submit",
  async (e) => {
    e.preventDefault();

    // カンマ区切りで入力された例外ドメインを配列に変換（空文字を除く）
    const exceptionsInput = <HTMLTextAreaElement> document.getElementById(
      "domainExceptions",
    );

    const exceptionsArray = exceptionsInput.value.split(",")
      .map((item) => item.trim())
      .filter((item) => item);

    const options = {
      groupPinned: groupPinnedElement?.checked,
      regroupExisting: regroupExistingElement?.checked,
      mergeSubdomains: mergeSubdomainsElement?.checked,
      collapseGroup: collapseGroupElement?.checked,
      domainExceptions: exceptionsArray,
    };

    await chrome.storage.sync.set(options);

    const saveStatus = <HTMLParagraphElement> document.getElementById(
      "save-status",
    );
    saveStatus.textContent = "Options saved.";
    setTimeout(() => saveStatus.textContent = "", 2000);
  },
);
