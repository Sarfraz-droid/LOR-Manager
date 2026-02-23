"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";
import { Professor, UniversityApplication, LoRRequest } from "./types";

// ---------------------------------------------------------------------------
// Row types returned by Supabase (snake_case column names)
// ---------------------------------------------------------------------------
type ProfessorRow = {
  id: string;
  name: string;
  email: string;
  expertise: string;
  courses: string[];
};

type ApplicationRow = {
  id: string;
  university: string;
  program: string;
  deadline: string;
  description: string;
};

type RequestRow = {
  id: string;
  professor_id: string;
  application_id: string;
  status: LoRRequest["status"];
  deadline: string;
  reminder_sent: boolean;
  content: string;
  last_edited: string | null;
};

// ---------------------------------------------------------------------------
// Mappers: DB rows → TypeScript types
// ---------------------------------------------------------------------------
function toProfessor(row: ProfessorRow): Professor {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    expertise: row.expertise,
    courses: row.courses ?? [],
  };
}

function toApplication(row: ApplicationRow): UniversityApplication {
  return {
    id: row.id,
    university: row.university,
    program: row.program,
    deadline: row.deadline,
    description: row.description,
  };
}

function toRequest(row: RequestRow): LoRRequest {
  return {
    id: row.id,
    professorId: row.professor_id,
    applicationId: row.application_id,
    status: row.status,
    deadline: row.deadline,
    reminderSent: row.reminder_sent,
    content: row.content ?? "",
    lastEdited: row.last_edited ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useLoRStore() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [applications, setApplications] = useState<UniversityApplication[]>([]);
  const [requests, setRequests] = useState<LoRRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [profsRes, appsRes, reqsRes] = await Promise.all([
      supabase.from("professors").select("*"),
      supabase.from("university_applications").select("*"),
      supabase.from("lor_requests").select("*"),
    ]);

    if (!profsRes.error) setProfessors((profsRes.data as ProfessorRow[]).map(toProfessor));
    if (!appsRes.error) setApplications((appsRes.data as ApplicationRow[]).map(toApplication));
    if (!reqsRes.error) setRequests((reqsRes.data as RequestRow[]).map(toRequest));

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // -------------------------------------------------------------------------
  // Mutations
  // -------------------------------------------------------------------------
  const addProfessor = useCallback(async (prof: Professor) => {
    const { error } = await supabase.from("professors").insert({
      id: prof.id,
      name: prof.name,
      email: prof.email,
      expertise: prof.expertise,
      courses: prof.courses,
    });
    if (!error) setProfessors((prev) => [...prev, prof]);
    else console.error("addProfessor:", error.message);
  }, []);

  const addApplication = useCallback(async (app: UniversityApplication) => {
    const { error } = await supabase.from("university_applications").insert({
      id: app.id,
      university: app.university,
      program: app.program,
      deadline: app.deadline,
      description: app.description,
    });
    if (!error) setApplications((prev) => [...prev, app]);
    else console.error("addApplication:", error.message);
  }, []);

  const addRequest = useCallback(async (req: LoRRequest) => {
    const { error } = await supabase.from("lor_requests").insert({
      id: req.id,
      professor_id: req.professorId,
      application_id: req.applicationId,
      status: req.status,
      deadline: req.deadline,
      reminder_sent: req.reminderSent,
      content: req.content ?? "",
    });
    if (!error) setRequests((prev) => [...prev, req]);
    else console.error("addRequest:", error.message);
  }, []);

  const updateRequestStatus = useCallback(async (id: string, status: LoRRequest["status"]) => {
    const { error } = await supabase
      .from("lor_requests")
      .update({ status })
      .eq("id", id);
    if (!error)
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    else console.error("updateRequestStatus:", error.message);
  }, []);

  const updateRequestContent = useCallback(async (id: string, content: string) => {
    const lastEdited = new Date().toISOString();
    const { error } = await supabase
      .from("lor_requests")
      .update({ content, last_edited: lastEdited })
      .eq("id", id);
    if (!error)
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, content, lastEdited } : r))
      );
    else console.error("updateRequestContent:", error.message);
  }, []);

  const markReminded = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("lor_requests")
      .update({ reminder_sent: true })
      .eq("id", id);
    if (!error)
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, reminderSent: true } : r))
      );
    else console.error("markReminded:", error.message);
  }, []);

  const deleteProfessor = useCallback(async (id: string) => {
    const { error } = await supabase.from("professors").delete().eq("id", id);
    if (!error) {
      setProfessors((prev) => prev.filter((p) => p.id !== id));
      // Cascade deletes lor_requests in DB; mirror locally
      setRequests((prev) => prev.filter((r) => r.professorId !== id));
    } else console.error("deleteProfessor:", error.message);
  }, []);

  const deleteApplication = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("university_applications")
      .delete()
      .eq("id", id);
    if (!error) {
      setApplications((prev) => prev.filter((a) => a.id !== id));
      // Cascade deletes lor_requests in DB; mirror locally
      setRequests((prev) => prev.filter((r) => r.applicationId !== id));
    } else console.error("deleteApplication:", error.message);
  }, []);

  const deleteRequest = useCallback(async (id: string) => {
    const { error } = await supabase.from("lor_requests").delete().eq("id", id);
    if (!error)
      setRequests((prev) => prev.filter((r) => r.id !== id));
    else console.error("deleteRequest:", error.message);
  }, []);

  return {
    professors,
    applications,
    requests,
    isLoading,
    addProfessor,
    addApplication,
    addRequest,
    updateRequestStatus,
    updateRequestContent,
    markReminded,
    deleteProfessor,
    deleteApplication,
    deleteRequest,
  };
}
