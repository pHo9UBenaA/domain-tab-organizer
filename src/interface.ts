type DeletionRecord = {
  timestamp: number;
  groupName: string;
  windowType: string;
  tabs: { url: string; title: string }[];
};

export type { DeletionRecord };
