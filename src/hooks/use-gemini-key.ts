"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "lor_manager_gemini_api_key";

export function useGeminiKey() {
  const [geminiKey, setGeminiKeyState] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setGeminiKeyState(stored);
  }, []);

  const setGeminiKey = useCallback((key: string) => {
    if (key) {
      localStorage.setItem(STORAGE_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setGeminiKeyState(key);
  }, []);

  return { geminiKey, setGeminiKey };
}
