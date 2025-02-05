import { LOCAL_STORAGE_KEYS } from "./constant.ts";

type DeletionRecord = {
  timestamp: number;
  groupName: string;
  windowType: keyof typeof LOCAL_STORAGE_KEYS;
  tabs: { url: string; title: string }[];
};

export type { DeletionRecord };
