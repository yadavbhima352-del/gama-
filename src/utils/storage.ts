import { ChatSession, Message } from '../types/chat';

const SESSIONS_STORAGE_KEY = 'nova_ai_sessions_v1';
const ACTIVE_SESSION_STORAGE_KEY = 'nova_ai_active_session_v1';

export function createNewSession(initialTitle?: string): ChatSession {
  const newId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  return {
    id: newId,
    title: initialTitle || 'New Conversation',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };
}

export function loadSessionsFromStorage(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) {
      const defaultSession = createNewSession();
      saveSessionsToStorage([defaultSession]);
      return [defaultSession];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const defaultSession = createNewSession();
    return [defaultSession];
  } catch (e) {
    console.error('Failed to parse sessions from localStorage:', e);
    return [createNewSession()];
  }
}

export function saveSessionsToStorage(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to persist sessions to localStorage:', e);
  }
}

export function getActiveSessionId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setActiveSessionId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, id);
  } catch {
    // ignore
  }
}

export function generateTitleFromMessage(message: string): string {
  const clean = message.trim().replace(/^["']|["']$/g, '');
  if (clean.length <= 32) return clean;
  return clean.substring(0, 32) + '...';
}
