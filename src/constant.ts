const LOCAL_STORAGE_KEYS = {
  normal: "deletionHistory_normal",
  incognito: "deletionHistory_incognito",
} as const;

const DEFAULT_OPTIONS = {
  groupPinned: false, // ピン留めタブはグループ化しない（デフォルト）
  regroupExisting: false, // 既存のグループはそのままにする（デフォルト）
  mergeSubdomains: false, // サブドメインをマージしない（デフォルト）
  domainExceptions: [], // 例外ドメイン
} as const;

export { DEFAULT_OPTIONS, LOCAL_STORAGE_KEYS };
