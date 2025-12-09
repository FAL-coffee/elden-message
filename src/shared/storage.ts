export interface StorageData {
  userId?: string;
  ratedMessages?: string[];
  showMessages?: boolean;
}

export async function getStorageData<K extends keyof StorageData>(
  key: K
): Promise<StorageData[K] | undefined> {
  const result = await chrome.storage.local.get(key);
  return result[key] as StorageData[K] | undefined;
}

export async function setStorageData<K extends keyof StorageData>(
  key: K,
  value: StorageData[K]
): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

export async function getUserId(): Promise<string> {
  let userId = await getStorageData('userId');

  if (!userId) {
    userId = generateUserId();
    await setStorageData('userId', userId);
  }

  return userId;
}

export async function hasRatedMessage(messageId: string): Promise<boolean> {
  const ratedMessages = await getStorageData('ratedMessages') || [];
  return ratedMessages.includes(messageId);
}

export async function addRatedMessage(messageId: string): Promise<void> {
  const ratedMessages = await getStorageData('ratedMessages') || [];
  if (!ratedMessages.includes(messageId)) {
    ratedMessages.push(messageId);
    await setStorageData('ratedMessages', ratedMessages);
  }
}

function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
