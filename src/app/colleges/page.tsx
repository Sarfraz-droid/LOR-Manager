"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Building2 } from "lucide-react";
import { CollegeManagementSection } from "@/components/dashboard/CollegeManagementSection";
import { LoREditor } from "@/components/dashboard/LoREditor";
import { SopEditor } from "@/components/dashboard/SopEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useGeminiKey } from "@/hooks/use-gemini-key";
import { useLoRStore } from "@/lib/store";
import { useSopStore } from "@/lib/sopStore";
import type { LoRRequest, SopEntry } from "@/lib/types";

export default function CollegesPage() {
  const {
    user,
    authLoading,
    professors,
    applications,
    requests,
    isLoading,
    addApplication,
    updateRequestContent,
    generateShareToken,
  } = useLoRStore();
  const {
    sops,
    isLoading: isSopLoading,
    updateSopContent,
  } = useSopStore(user?.id ?? null);
  const { toast } = useToast();
  const { geminiKey } = useGeminiKey();
  const [editingRequest, setEditingRequest] = useState<LoRRequest | null>(null);
  const [editingSop, setEditingSop] = useState<SopEntry | null>(null);

  const handleSaveLoR = (content: string) => {
    if (!editingRequest) return;
    updateRequestContent(editingRequest.id, content);
    toast({
      title: "Draft Saved",
      description: "Your letter of recommendation has been saved in the college workspace.",
    });
  };

  const handleSaveSop = (content: string) => {
    if (!editingSop) return;
    updateSopContent(editingSop.id, content);
    toast({
      title: "SOP Saved",
      description: "Your Statement of Purpose has been saved in the college workspace.",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Loading colleges…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-lg w-full border-accent/20">
          <CardContent className="p-8 space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-headline font-bold text-primary">College Management</h1>
              <p className="text-sm text-muted-foreground">
                Sign in from the main dashboard to manage shortlists, connected SOPs, and connected LORs.
              </p>
            </div>
            <Button asChild className="bg-primary text-primary-foreground">
              <Link href="/">Go to main dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <Toaster />

      {(isLoading || isSopLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            <p className="text-sm text-muted-foreground font-medium">Loading college workspace…</p>
          </div>
        </div>
      )}

      {editingRequest && (
        <LoREditor
          request={editingRequest}
          professor={professors.find((professor) => professor.id === editingRequest.professorId)}
          application={applications.find((application) => application.id === editingRequest.applicationId)}
          onSave={handleSaveLoR}
          onClose={() => setEditingRequest(null)}
          onShare={generateShareToken}
          geminiKey={geminiKey}
        />
      )}

      {editingSop && (
        <SopEditor
          sop={editingSop}
          onSave={handleSaveSop}
          onClose={() => setEditingSop(null)}
          geminiKey={geminiKey}
        />
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Button asChild variant="ghost" className="px-0 text-muted-foreground hover:text-primary">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">College Management</h1>
              <p className="text-sm md:text-base text-muted-foreground font-body">
                Stay focused on each college shortlist, the SOPs attached to it, the LORs attached to it, and the public link you can share.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-accent/20">
              <CardContent className="p-4">
                <p className="text-xs uppercase text-muted-foreground font-bold">Colleges</p>
                <p className="text-2xl font-headline font-bold text-primary">{applications.length}</p>
              </CardContent>
            </Card>
            <Card className="border-accent/20">
              <CardContent className="p-4">
                <p className="text-xs uppercase text-muted-foreground font-bold">Connected SOPs</p>
                <p className="text-2xl font-headline font-bold text-primary">{sops.length}</p>
              </CardContent>
            </Card>
            <Card className="border-accent/20">
              <CardContent className="p-4">
                <p className="text-xs uppercase text-muted-foreground font-bold">Connected LORs</p>
                <p className="text-2xl font-headline font-bold text-primary">{requests.length}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <CollegeManagementSection
          applications={applications}
          requests={requests}
          sops={sops}
          addApplication={addApplication}
          title="College Workspace"
          description="This page is fully college-first: shortlist each college, inspect its connected SOPs and LORs, and share a public shortlist link."
          emptyMessage="No colleges added yet. Start by creating a shortlist."
        />
      </main>
    </div>
  );
}
