"use client";

import { useEffect, useState } from "react";
import { Professor, UniversityApplication, LoRRequest } from "./types";

const STORAGE_KEY = "lor-tracker-pro-data";

type AppData = {
  professors: Professor[];
  applications: UniversityApplication[];
  requests: LoRRequest[];
};

const DEFAULT_DATA: AppData = {
  professors: [
    {
      id: "p1",
      name: "Dr. Alice Smith",
      email: "alice.smith@university.edu",
      expertise: "Artificial Intelligence and Machine Learning",
      courses: ["CS101 Intro to AI", "CS402 Deep Learning"],
    },
    {
      id: "p2",
      name: "Prof. Robert Johnson",
      email: "r.johnson@university.edu",
      expertise: "Theoretical Physics and Quantum Mechanics",
      courses: ["PHYS201 Quantum Mechanics", "PHYS305 Thermodynamics"],
    },
  ],
  applications: [
    {
      id: "a1",
      university: "Stanford University",
      program: "M.S. in Computer Science",
      deadline: "2025-12-15",
      description: "Graduate school application for AI track.",
    },
  ],
  requests: [
    {
      id: "r1",
      professorId: "p1",
      applicationId: "a1",
      status: "In Progress",
      deadline: "2025-12-01",
      reminderSent: false,
      content: "",
    },
  ],
};

export function useLoRStore() {
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse stored data", e);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isInitialized]);

  const addProfessor = (prof: Professor) => {
    setData((prev) => ({ ...prev, professors: [...prev.professors, prof] }));
  };

  const addApplication = (app: UniversityApplication) => {
    setData((prev) => ({ ...prev, applications: [...prev.applications, app] }));
  };

  const addRequest = (req: LoRRequest) => {
    setData((prev) => ({ ...prev, requests: [...prev.requests, req] }));
  };

  const updateRequestStatus = (id: string, status: LoRRequest["status"]) => {
    setData((prev) => ({
      ...prev,
      requests: prev.requests.map((r) => (r.id === id ? { ...r, status } : r)),
    }));
  };

  const updateRequestContent = (id: string, content: string) => {
    setData((prev) => ({
      ...prev,
      requests: prev.requests.map((r) => 
        r.id === id ? { ...r, content, lastEdited: new Date().toISOString() } : r
      ),
    }));
  };

  const markReminded = (id: string) => {
    setData((prev) => ({
      ...prev,
      requests: prev.requests.map((r) => 
        r.id === id ? { ...r, reminderSent: true } : r
      ),
    }));
  };

  const deleteProfessor = (id: string) => {
    setData((prev) => ({
      ...prev,
      professors: prev.professors.filter((p) => p.id !== id),
      requests: prev.requests.filter((r) => r.professorId !== id),
    }));
  };

  const deleteApplication = (id: string) => {
    setData((prev) => ({
      ...prev,
      applications: prev.applications.filter((a) => a.id !== id),
      requests: prev.requests.filter((r) => r.applicationId !== id),
    }));
  };

  return {
    ...data,
    addProfessor,
    addApplication,
    addRequest,
    updateRequestStatus,
    updateRequestContent,
    markReminded,
    deleteProfessor,
    deleteApplication,
  };
}
