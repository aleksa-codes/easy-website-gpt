interface Settings {
  apiKey?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function saveApiKey(apiKey: string): Promise<void> {
  await chrome.storage.sync.set({ apiKey });
}

export async function getApiKey(): Promise<string | null> {
  const result = await chrome.storage.sync.get('apiKey');
  return result.apiKey || null;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.sync.set({ settings });
}

export async function getSettings(): Promise<Settings | null> {
  const result = await chrome.storage.sync.get('settings');
  return result.settings || null;
}

export async function saveChatHistory(url: string, messages: Message[]): Promise<void> {
  const histories = await chrome.storage.local.get('chatHistories');
  const chatHistories = histories.chatHistories || {};

  chatHistories[url] = messages;
  await chrome.storage.local.set({ chatHistories });
}

export async function getChatHistory(url: string): Promise<Message[]> {
  const histories = await chrome.storage.local.get('chatHistories');
  const chatHistories = histories.chatHistories || {};
  return chatHistories[url] || [];
}

export async function clearChatHistory(url: string): Promise<void> {
  const histories = await chrome.storage.local.get('chatHistories');
  const chatHistories = histories.chatHistories || {};

  delete chatHistories[url];
  await chrome.storage.local.set({ chatHistories });
}
