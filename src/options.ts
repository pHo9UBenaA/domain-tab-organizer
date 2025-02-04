/// <reference types="npm:@types/chrome" />

const groupPinnedElement = <HTMLInputElement> document.getElementById(
  "groupPinned",
);

const regroupExistingElement = <HTMLInputElement> document.getElementById(
  "regroupExisting",
);

const mergeSubdomainsElement = <HTMLInputElement> document.getElementById(
  "mergeSubdomains",
);

const domainExceptionsElement = <HTMLTextAreaElement> document.getElementById(
  "domainExceptions",
);

document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.sync.get({
    groupPinned: false,
    regroupExisting: false,
    mergeSubdomains: true,
    domainExceptions: [],
  }, function (data) {
    if (groupPinnedElement) {
      groupPinnedElement.checked = data.groupPinned;
    }

    if (regroupExistingElement) {
      regroupExistingElement.checked = data.regroupExisting;
    }

    if (mergeSubdomainsElement) {
      mergeSubdomainsElement.checked = data.mergeSubdomains;
    }

    if (domainExceptionsElement) {
      domainExceptionsElement.value = Array.isArray(data.domainExceptions)
        ? data.domainExceptions.join(", ")
        : data.domainExceptions;
    }
  });
});

document.getElementById("optionsForm")?.addEventListener(
  "submit",
  function (e) {
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
      domainExceptions: exceptionsArray,
    };

    chrome.storage.sync.set(options, function () {
      const status = <HTMLParagraphElement> document.getElementById("status");
      status.textContent = "Options saved.";
      setTimeout(() => status.textContent = "", 2000);
    });
  },
);
