"use client";

import { useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { ApplicationResource, Professor, UniversityApplication, LoRRequest } from "./types";

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
  relevant_links: string[] | null;
  share_token: string | null;
};

type RequestRow = {
  id: string;
  professor_id: string;
  application_id: string;
  status: LoRRequest["status"];
  deadline: string;
  reminder_sent: boolean;
  content: string;
  google_docs_link: string | null;
  last_edited: string | null;
  share_token: string | null;
};

type ResourceRow = {
  id: string;
  application_id: string | null;
  resource_type: ApplicationResource["resourceType"];
  title: string;
  url: string | null;
  storage_path: string | null;
  filename: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  note_content: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
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
    relevantLinks: row.relevant_links ?? [],
    shareToken: row.share_token ?? undefined,
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
    googleDocsLink: row.google_docs_link ?? undefined,
    lastEdited: row.last_edited ?? undefined,
    shareToken: row.share_token ?? undefined,
  };
}

function toResource(row: ResourceRow): ApplicationResource {
  return {
    id: row.id,
    applicationId: row.application_id ?? undefined,
    resourceType: row.resource_type,
    title: row.title,
    url: row.url ?? undefined,
    storagePath: row.storage_path ?? undefined,
    filename: row.filename ?? undefined,
    mimeType: row.mime_type ?? undefined,
    sizeBytes: row.size_bytes ?? undefined,
    noteContent: row.note_content ?? undefined,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useLoRStore() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [applications, setApplications] = useState<UniversityApplication[]>([]);
  const [requests, setRequests] = useState<LoRRequest[]>([]);
  const [resources, setResources] = useState<ApplicationResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Listen to auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadData = useCallback(async (uid: string) => {
    setIsLoading(true);
    const [profsRes, appsRes, reqsRes, resourcesRes] = await Promise.all([
      supabase.from("professors").select("*").eq("user_id", uid),
      supabase.from("university_applications").select("*").eq("user_id", uid),
      supabase.from("lor_requests").select("*").eq("user_id", uid),
      supabase.from("application_resources").select("*").eq("user_id", uid),
    ]);

    if (!profsRes.error) setProfessors((profsRes.data as ProfessorRow[]).map(toProfessor));
    if (!appsRes.error) setApplications((appsRes.data as ApplicationRow[]).map(toApplication));
    if (!reqsRes.error) setRequests((reqsRes.data as RequestRow[]).map(toRequest));
    if (!resourcesRes.error) setResources((resourcesRes.data as ResourceRow[]).map(toResource));

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      loadData(user.id);
    } else {
      setProfessors([]);
      setApplications([]);
      setRequests([]);
      setResources([]);
    }
  }, [user, loadData]);

  // -------------------------------------------------------------------------
  // Auth
  // -------------------------------------------------------------------------
  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error ? error.message : null;
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<string | null> => {
    // Use the explicitly configured site URL (required in production so Supabase
    // redirects back to the deployed app instead of its default Site URL).
    // Falls back to the current browser origin for local development.
    const redirectTo =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    return error ? error.message : null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // -------------------------------------------------------------------------
  // Mutations
  // -------------------------------------------------------------------------
  const addProfessor = useCallback(async (prof: Professor) => {
    if (!user) return;
    const { error } = await supabase.from("professors").insert({
      id: prof.id,
      user_id: user.id,
      name: prof.name,
      email: prof.email,
      expertise: prof.expertise,
      courses: prof.courses,
    });
    if (!error) setProfessors((prev) => [...prev, prof]);
    else console.error("addProfessor:", error.message);
  }, [user]);

  const addApplication = useCallback(async (app: UniversityApplication) => {
    if (!user) return;
    const { error } = await supabase.from("university_applications").insert({
      id: app.id,
      user_id: user.id,
      university: app.university,
      program: app.program,
      deadline: app.deadline,
      description: app.description,
      relevant_links: app.relevantLinks,
    });
    if (!error) setApplications((prev) => [...prev, app]);
    else console.error("addApplication:", error.message);
  }, [user]);

  const updateApplication = useCallback(async (
    id: string,
    updates: Pick<UniversityApplication, "university" | "program" | "deadline" | "description" | "relevantLinks">
  ) => {
    const { error } = await supabase
      .from("university_applications")
      .update({
        university: updates.university,
        program: updates.program,
        deadline: updates.deadline,
        description: updates.description,
        relevant_links: updates.relevantLinks,
      })
      .eq("id", id);

    if (error) {
      console.error("updateApplication:", error.message);
      return;
    }

    setApplications((prev) =>
      prev.map((application) =>
        application.id === id ? { ...application, ...updates } : application
      )
    );
  }, []);

  const addRequest = useCallback(async (req: LoRRequest) => {
    if (!user) return;
    const { error } = await supabase.from("lor_requests").insert({
      id: req.id,
      user_id: user.id,
      professor_id: req.professorId,
      application_id: req.applicationId,
      status: req.status,
      deadline: req.deadline,
      reminder_sent: req.reminderSent,
      content: req.content ?? "",
      google_docs_link: req.googleDocsLink ?? null,
    });
    if (!error) setRequests((prev) => [...prev, req]);
    else console.error("addRequest:", error.message);
  }, [user]);

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
      setResources((prev) => prev.filter((resource) => resource.applicationId !== id));
    } else console.error("deleteApplication:", error.message);
  }, []);

  const fetchResources = useCallback(async (applicationId?: string) => {
    if (!user) return [] as ApplicationResource[];

    let query = supabase
      .from("application_resources")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (applicationId) {
      query = query.eq("application_id", applicationId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("fetchResources:", error.message);
      return [];
    }

    const mappedResources = (data as ResourceRow[]).map(toResource);
    if (!applicationId) {
      setResources(mappedResources);
    } else {
      setResources((prev) => [
        ...prev.filter((resource) => resource.applicationId !== applicationId),
        ...mappedResources,
      ]);
    }
    return mappedResources;
  }, [user]);

  const addResource = useCallback(async (resource: Omit<ApplicationResource, "createdAt" | "updatedAt">) => {
    if (!user) return false;

    const now = new Date().toISOString();
    const { error } = await supabase.from("application_resources").insert({
      id: resource.id,
      user_id: user.id,
      application_id: resource.applicationId ?? null,
      resource_type: resource.resourceType,
      title: resource.title,
      url: resource.url ?? null,
      storage_path: resource.storagePath ?? null,
      filename: resource.filename ?? null,
      mime_type: resource.mimeType ?? null,
      size_bytes: resource.sizeBytes ?? null,
      note_content: resource.noteContent ?? null,
      tags: resource.tags,
      created_at: now,
      updated_at: now,
    });

    if (error) {
      console.error("addResource:", error.message);
      return false;
    }

    setResources((prev) => [...prev, { ...resource, createdAt: now, updatedAt: now }]);
    return true;
  }, [user]);

  const uploadResource = useCallback(async ({
    applicationId,
    title,
    tags,
    file,
  }: {
    applicationId?: string;
    title: string;
    tags: string[];
    file: File;
  }) => {
    if (!user) return null as ApplicationResource | null;

    const id = crypto.randomUUID();
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const folderSegment = applicationId ?? "global";
    const storagePath = `${user.id}/${folderSegment}/${Date.now()}-${safeFilename}`;

    const uploadResult = await supabase.storage
      .from("application-resources")
      .upload(storagePath, file, {
        contentType: file.type || undefined,
        upsert: false,
      });

    if (uploadResult.error) {
      console.error("uploadResource/upload:", uploadResult.error.message);
      return null;
    }

    const now = new Date().toISOString();
    const insertResult = await supabase.from("application_resources").insert({
      id,
      user_id: user.id,
      application_id: applicationId ?? null,
      resource_type: "upload",
      title,
      url: null,
      storage_path: storagePath,
      filename: file.name,
      mime_type: file.type || null,
      size_bytes: file.size,
      note_content: null,
      tags,
      created_at: now,
      updated_at: now,
    });

    if (insertResult.error) {
      await supabase.storage.from("application-resources").remove([storagePath]);
      console.error("uploadResource/insert:", insertResult.error.message);
      return null;
    }

    const createdResource: ApplicationResource = {
      id,
      applicationId,
      resourceType: "upload",
      title,
      storagePath,
      filename: file.name,
      mimeType: file.type || undefined,
      sizeBytes: file.size,
      tags,
      createdAt: now,
      updatedAt: now,
    };
    setResources((prev) => [...prev, createdResource]);
    return createdResource;
  }, [user]);

  const updateResourceTags = useCallback(async (id: string, tags: string[]) => {
    const updatedAt = new Date().toISOString();
    const { error } = await supabase
      .from("application_resources")
      .update({ tags, updated_at: updatedAt })
      .eq("id", id);

    if (error) {
      console.error("updateResourceTags:", error.message);
      return false;
    }

    setResources((prev) =>
      prev.map((resource) =>
        resource.id === id ? { ...resource, tags, updatedAt } : resource
      )
    );
    return true;
  }, []);

  const deleteResource = useCallback(async (id: string) => {
    const resource = resources.find((entry) => entry.id === id);

    if (resource?.resourceType === "upload" && resource.storagePath) {
      const { error: storageError } = await supabase.storage
        .from("application-resources")
        .remove([resource.storagePath]);
      if (storageError) {
        console.error("deleteResource/storage:", storageError.message);
      }
    }

    const { error } = await supabase.from("application_resources").delete().eq("id", id);
    if (error) {
      console.error("deleteResource:", error.message);
      return false;
    }

    setResources((prev) => prev.filter((resourceEntry) => resourceEntry.id !== id));
    return true;
  }, [resources]);

  const generateShareToken = useCallback(async (id: string): Promise<string | null> => {
    const existing = requests.find((r) => r.id === id)?.shareToken;
    if (existing) return existing;
    const token = crypto.randomUUID();
    const { error } = await supabase
      .from("lor_requests")
      .update({ share_token: token })
      .eq("id", id);
    if (!error) {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, shareToken: token } : r))
      );
      return token;
    }
    console.error("generateShareToken:", error.message);
    return null;
  }, [requests]);

  const generateApplicationShareToken = useCallback(async (id: string): Promise<string | null> => {
    const existing = applications.find((application) => application.id === id)?.shareToken;
    if (existing) return existing;
    const token = crypto.randomUUID();
    const { error } = await supabase
      .from("university_applications")
      .update({ share_token: token })
      .eq("id", id);
    if (!error) {
      setApplications((prev) =>
        prev.map((application) =>
          application.id === id ? { ...application, shareToken: token } : application
        )
      );
      return token;
    }
    console.error("generateApplicationShareToken:", error.message);
    return null;
  }, [applications]);

  const deleteRequest = useCallback(async (id: string) => {
    const { error } = await supabase.from("lor_requests").delete().eq("id", id);
    if (!error)
      setRequests((prev) => prev.filter((r) => r.id !== id));
    else console.error("deleteRequest:", error.message);
  }, []);

  return {
    user,
    authLoading,
    professors,
    applications,
    requests,
    resources,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    addProfessor,
    addApplication,
    updateApplication,
    addRequest,
    fetchResources,
    addResource,
    uploadResource,
    updateResourceTags,
    deleteResource,
    updateRequestStatus,
    updateRequestContent,
    markReminded,
    generateShareToken,
    generateApplicationShareToken,
    deleteProfessor,
    deleteApplication,
    deleteRequest,
  };
}
