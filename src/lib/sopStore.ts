"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";
import { SopEntry } from "./types";

// ---------------------------------------------------------------------------
// Row type returned by Supabase (snake_case column names)
// ---------------------------------------------------------------------------
type SopRow = {
  id: string;
  college: string;
  program: string;
  deadline: string;
  status: SopEntry["status"];
  content: string;
  last_edited: string | null;
};

// ---------------------------------------------------------------------------
// Mapper: DB row → TypeScript type
// ---------------------------------------------------------------------------
function toSopEntry(row: SopRow): SopEntry {
  return {
    id: row.id,
    college: row.college,
    program: row.program,
    deadline: row.deadline,
    status: row.status,
    content: row.content ?? "",
    lastEdited: row.last_edited ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Hook
// Accepts the authenticated user's ID so data is scoped per user.
// Pass null when no user is signed in; the hook will clear state and skip DB calls.
// ---------------------------------------------------------------------------
export function useSopStore(userId: string | null) {
  const [sops, setSops] = useState<SopEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async (uid: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("sop_entries")
      .select("*")
      .eq("user_id", uid);
    if (!error) setSops((data as SopRow[]).map(toSopEntry));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (userId) {
      loadData(userId);
    } else {
      setSops([]);
    }
  }, [userId, loadData]);

  // -------------------------------------------------------------------------
  // Mutations
  // -------------------------------------------------------------------------
  const addSop = useCallback(async (sop: SopEntry) => {
    if (!userId) return;
    const { error } = await supabase.from("sop_entries").insert({
      id: sop.id,
      user_id: userId,
      college: sop.college,
      program: sop.program,
      deadline: sop.deadline,
      status: sop.status,
      content: sop.content ?? "",
    });
    if (!error) setSops((prev) => [...prev, sop]);
    else console.error("addSop:", error.message);
  }, [userId]);

  const updateSopStatus = useCallback(async (id: string, status: SopEntry["status"]) => {
    const { error } = await supabase
      .from("sop_entries")
      .update({ status })
      .eq("id", id);
    if (!error)
      setSops((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    else console.error("updateSopStatus:", error.message);
  }, []);

  const updateSopContent = useCallback(async (id: string, content: string) => {
    const lastEdited = new Date().toISOString();
    const { error } = await supabase
      .from("sop_entries")
      .update({ content, last_edited: lastEdited })
      .eq("id", id);
    if (!error)
      setSops((prev) =>
        prev.map((s) => (s.id === id ? { ...s, content, lastEdited } : s))
      );
    else console.error("updateSopContent:", error.message);
  }, []);

  const deleteSop = useCallback(async (id: string) => {
    const { error } = await supabase.from("sop_entries").delete().eq("id", id);
    if (!error) setSops((prev) => prev.filter((s) => s.id !== id));
    else console.error("deleteSop:", error.message);
  }, []);

  return {
    sops,
    isLoading,
    addSop,
    updateSopStatus,
    updateSopContent,
    deleteSop,
  };
}
