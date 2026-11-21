import { useCallback, useEffect, useState } from "react";

const HISTORY_KEY = "lingua-conversation-history";
const MAX_HISTORY_ITEMS = 100;

function isHistoryEntry(item) {
  return (
    item !== null &&
    typeof item === "object" &&
    typeof item.id === "string" &&
    item.id.length <= 100 &&
    (item.kind === "translation" ||
      item.kind === "practice" ||
      item.kind === "pronunciation") &&
    typeof item.source === "string" &&
    item.source.length > 0 &&
    item.source.length <= 10000 &&
    typeof item.translation === "string" &&
    item.translation.length <= 20000 &&
    (item.targetLocale === undefined ||
      item.targetLocale === "en-US" ||
      item.targetLocale === "vi-VN") &&
    (item.kind !== "pronunciation" ||
      (Number.isInteger(item.score) && item.score >= 0 && item.score <= 100)) &&
    Number.isSafeInteger(item.createdAt) &&
    Number.isFinite(new Date(item.createdAt).getTime())
  );
}

function readHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    if (!Array.isArray(stored)) return { entries: [], error: "" };

    return {
      entries: stored.slice(0, MAX_HISTORY_ITEMS).filter(isHistoryEntry),
      error: "",
    };
  } catch (error) {
    console.error("Could not load conversation history.", error);
    return { entries: [], error: "Không thể đọc lịch sử trên thiết bị này." };
  }
}

export function useConversationHistory() {
  const [initialState] = useState(readHistory);
  const [entries, setEntries] = useState(initialState.entries);
  const [error, setError] = useState(initialState.error);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
      setError("");
    } catch (storageError) {
      console.error("Could not save conversation history.", storageError);
      setError("Không thể lưu lịch sử. Hãy kiểm tra dung lượng lưu trữ của trình duyệt.");
    }
  }, [entries]);

  const addEntry = useCallback((item) => {
    setEntries((current) =>
      [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: Date.now(),
          ...item,
        },
        ...current,
      ].slice(0, MAX_HISTORY_ITEMS),
    );
  }, []);

  const clearHistory = useCallback(() => setEntries([]), []);

  return { entries, error, addEntry, clearHistory };
}
