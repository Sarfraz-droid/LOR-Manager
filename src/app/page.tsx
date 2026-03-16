"use client";

import { useState } from "react";
import { BookOpen, Building2, FolderOpen, GraduationCap, LogOut, Menu, X } from "lucide-react";
import { motion } from "motion/react";
import { useLoRStore } from "@/lib/store";
import { useSopStore } from "@/lib/sopStore";
import type { LoRRequest, SopEntry } from "@/lib/types";
import { AuthForm } from "@/components/auth/AuthForm";
import { LandingPage } from "@/components/landing/LandingPage";
import { CollegeManagementSection } from "@/components/dashboard/CollegeManagementSection";
import { GlobalResourcesSection } from "@/components/dashboard/GlobalResourcesSection";
import { ProfessorCard } from "@/components/dashboard/ProfessorCard";
import { NewProfessorDialog } from "@/components/dashboard/NewProfessorDialog";
import { LoREditor } from "@/components/dashboard/LoREditor";
import { SopEditor } from "@/components/dashboard/SopEditor";
import { GeminiKeyDialog } from "@/components/dashboard/GeminiKeyDialog";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useGeminiKey } from "@/hooks/use-gemini-key";
import { cn } from "@/lib/utils";

export default function Home() {
  const {
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
    addResource,
    uploadResource,
    updateResourceTags,
    deleteResource,
    updateRequestContent,
    generateShareToken,
      deleteProfessor,
  } = useLoRStore();

  const {
    sops,
    isLoading: isSopLoading,
    updateSopContent,
  } = useSopStore(user?.id ?? null);

  const { toast } = useToast();
  const { geminiKey, setGeminiKey } = useGeminiKey();
  const [showAuth, setShowAuth] = useState<"landing" | "signin" | "signup">("landing");
  const [editingRequest, setEditingRequest] = useState<LoRRequest | null>(null);
  const [editingSop, setEditingSop] = useState<SopEntry | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"colleges" | "professors" | "resources">("colleges");

  const handleSaveLoR = (content: string) => {
    if (!editingRequest) return;
    updateRequestContent(editingRequest.id, content);
    toast({
      title: "Draft Saved",
      description: "Your letter of recommendation has been saved to your dashboard.",
    });
  };

  const handleSaveSop = (content: string) => {
    if (!editingSop) return;
    updateSopContent(editingSop.id, content);
    toast({
      title: "SOP Saved",
      description: "Your Statement of Purpose has been saved to your dashboard.",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showAuth === "landing") {
      return (
        <>
          <Toaster />
          <LandingPage
            onGetStarted={() => setShowAuth("signup")}
            onSignIn={() => setShowAuth("signin")}
          />
        </>
      );
    }

    return (
      <>
        <Toaster />
        <AuthForm
          onSignIn={signIn}
          onSignUp={signUp}
          onSignInWithGoogle={signInWithGoogle}
          initialMode={showAuth === "signup" ? "signup" : "signin"}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-background font-body">
      <Toaster />

      {(isLoading || isSopLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            <p className="text-sm text-muted-foreground font-medium">Loading data...</p>
          </div>
        </div>
      )}

      {editingRequest && (
        <LoREditor
          request={editingRequest}
          professor={professors.find((entry) => entry.id === editingRequest.professorId)}
          application={applications.find((entry) => entry.id === editingRequest.applicationId)}
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

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-surface-1/90 text-foreground p-6 flex flex-col gap-8 border-r border-border/80 shadow-2xl backdrop-blur-xl",
          "transition-transform duration-300 ease-in-out",
          "md:relative md:translate-x-0 md:inset-auto md:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg shadow-lg shadow-primary/20">
            <BookOpen className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-headline font-semibold leading-none tracking-wide">LoR Tracker</h1>
            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-accent">College First</span>
          </div>
          <button
            className="ml-auto md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          <div className="text-[10px] uppercase font-semibold tracking-[0.24em] text-muted-foreground mb-2">Main</div>
          <button
            onClick={() => { setActiveTab("colleges"); setSidebarOpen(false); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left transition-colors ${activeTab === "colleges" ? "bg-primary/20 text-primary" : "hover:bg-secondary/70"}`}
          >
            <Building2 className="h-4 w-4" />
            <span className="text-sm font-medium">College List</span>
          </button>
            <button
              onClick={() => { setActiveTab("professors"); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left transition-colors ${activeTab === "professors" ? "bg-primary/20 text-primary" : "hover:bg-secondary/70"}`}
            >
              <GraduationCap className="h-4 w-4" />
              <span className="text-sm font-medium">Professors</span>
            </button>
            <button
              onClick={() => { setActiveTab("resources"); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left transition-colors ${activeTab === "resources" ? "bg-primary/20 text-primary" : "hover:bg-secondary/70"}`}
            >
              <FolderOpen className="h-4 w-4" />
              <span className="text-sm font-medium">Resources</span>
            </button>
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <div className="px-1">
            <p className="text-[10px] text-muted-foreground truncate mb-2">{user.email}</p>
            <GeminiKeyDialog geminiKey={geminiKey} onSave={setGeminiKey} />
            <Button
              variant="outline"
              size="sm"
              className="w-full border-border/80 hover:bg-secondary/80 bg-transparent mt-1"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto min-w-0">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-md">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-headline font-semibold text-primary">LoR Tracker</span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl md:text-4xl font-headline font-semibold text-primary">College Workspace</h2>
            <p className="text-muted-foreground font-body text-sm md:text-base">
              Start with the college list, then attach SOPs and LORs for each shortlist.
            </p>
          </div>
        </motion.header>

        {activeTab === "colleges" && (
          <CollegeManagementSection
          applications={applications}
          requests={requests}
          sops={sops}
          addApplication={addApplication}
          title="College List"
          description="Add your colleges first, then create SOP and LOR items from each college row."
          emptyMessage="No colleges tracked yet. Add a college to start building SOP and LOR items."
          />
        )}

          {activeTab === "professors" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center gap-3">
                <div>
                  <h3 className="text-2xl font-headline font-semibold text-primary">Professors</h3>
                  <p className="text-sm text-muted-foreground font-body">Manage the professors you are requesting letters from.</p>
                </div>
                <NewProfessorDialog onAdd={addProfessor} />
              </div>
              {professors.length === 0 ? (
                <p className="text-center text-muted-foreground italic py-12">No professors added yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {professors.map((professor, idx) => (
                    <ProfessorCard key={professor.id} professor={professor} onDelete={deleteProfessor} index={idx} />
                  ))}
                </div>
              )}
            </div>
          )}
        {activeTab === "resources" && (
          <GlobalResourcesSection
            applications={applications}
            resources={resources}
            addResource={addResource}
            uploadResource={uploadResource}
            updateResourceTags={updateResourceTags}
            deleteResource={deleteResource}
          />
        )}
      </main>
    </div>
  );
}
