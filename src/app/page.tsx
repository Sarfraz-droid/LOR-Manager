"use client";

import { useState, useEffect, useRef } from "react";
import { useLoRStore } from "@/lib/store";
import { useSopStore } from "@/lib/sopStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ProfessorCard } from "@/components/dashboard/ProfessorCard";
import { LoRRequestRow } from "@/components/dashboard/LoRRequestRow";
import { SopRow } from "@/components/dashboard/SopRow";
import { Table, TableBody, TableHeader, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { NewProfessorDialog } from "@/components/dashboard/NewProfessorDialog";
import { NewApplicationDialog } from "@/components/dashboard/NewApplicationDialog";
import { NewRequestDialog } from "@/components/dashboard/NewRequestDialog";
import { NewSopDialog } from "@/components/dashboard/NewSopDialog";
import { AISuggestionTool } from "@/components/dashboard/AISuggestionTool";
import { LoREditor } from "@/components/dashboard/LoREditor";
import { SopEditor } from "@/components/dashboard/SopEditor";
import { GraduationCap, ClipboardList, BookOpen, Sparkles, LayoutDashboard, AlertTriangle, ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoRRequest, SopEntry } from "@/lib/types";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { 
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
  } = useLoRStore();

  const {
    sops,
    isLoading: isSopLoading,
    addSop,
    updateSopStatus,
    updateSopContent,
    deleteSop,
  } = useSopStore();

  const { toast } = useToast();
  const [editingRequest, setEditingRequest] = useState<LoRRequest | null>(null);
  const [editingSop, setEditingSop] = useState<SopEntry | null>(null);
  // Track which request IDs have already triggered a reminder this session so
  // the effect never fires toast/markReminded twice for the same request even
  // while the async markReminded call is still in-flight.
  const remindedRef = useRef<Set<string>>(new Set());

  const pendingCount = requests.filter(r => r.status !== "Submitted").length;

  // Automated reminders for the student
  useEffect(() => {
    const urgentRequests = requests.filter(req => {
      if (req.status === "Submitted" || req.reminderSent || remindedRef.current.has(req.id)) return false;
      const deadlineDate = new Date(req.deadline);
      const today = new Date();
      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    });

    if (urgentRequests.length > 0) {
      urgentRequests.forEach(req => {
        remindedRef.current.add(req.id);
        const app = applications.find(a => a.id === req.applicationId);
        toast({
          title: "Personal Deadline Reminder",
          description: `The application for ${app?.university || 'an institution'} is due in less than a week!`,
          variant: "destructive",
        });
        markReminded(req.id);
      });
    }
  }, [requests, applications, toast, markReminded]);

  const handleSaveLoR = (content: string) => {
    if (editingRequest) {
      updateRequestContent(editingRequest.id, content);
      toast({
        title: "Draft Saved",
        description: "Your letter of recommendation has been saved to your dashboard.",
      });
    }
  };

  const handleSaveSop = (content: string) => {
    if (editingSop) {
      updateSopContent(editingSop.id, content);
      toast({
        title: "SOP Saved",
        description: "Your Statement of Purpose has been saved to your dashboard.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background font-body">
      <Toaster />

      {(isLoading || isSopLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            <p className="text-sm text-muted-foreground font-medium">Loading data…</p>
          </div>
        </div>
      )}
      
      {editingRequest && (
        <LoREditor 
          request={editingRequest}
          professor={professors.find(p => p.id === editingRequest.professorId)}
          application={applications.find(a => a.id === editingRequest.applicationId)}
          onSave={handleSaveLoR}
          onClose={() => setEditingRequest(null)}
        />
      )}

      {editingSop && (
        <SopEditor
          sop={editingSop}
          onSave={handleSaveSop}
          onClose={() => setEditingSop(null)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-primary text-primary-foreground p-6 flex flex-col gap-8 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-accent p-2 rounded-lg">
            <BookOpen className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-headline font-bold leading-none">LoR Tracker</h1>
            <span className="text-[10px] uppercase tracking-widest font-bold text-accent">Professional Edition</span>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <div className="text-[10px] uppercase font-bold text-primary-foreground/50 mb-2">Overview</div>
          <div className="flex items-center gap-3 px-3 py-2 bg-white/10 rounded-md">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </div>
        </nav>

        <div className="mt-auto p-4 bg-accent/20 rounded-xl border border-accent/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-accent" />
            <span className="text-xs font-bold uppercase">Personal Alerts</span>
          </div>
          <div className="text-3xl font-headline font-bold text-accent">{pendingCount}</div>
          <p className="text-[10px] text-primary-foreground/70 mt-1">Review your upcoming deadlines!</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-headline font-bold text-primary">Academic Portfolio</h2>
            <p className="text-muted-foreground font-literata">Manage your letters of recommendation, SOPs, and application targets.</p>
          </div>
          <div className="flex gap-2">
            <NewRequestDialog professors={professors} applications={applications} onAdd={addRequest} />
          </div>
        </header>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="bg-muted/50 p-1 h-auto mb-8 grid grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="requests" className="data-[state=active]:bg-white py-2">
              <ClipboardList className="h-4 w-4 mr-2" /> Requests
            </TabsTrigger>
            <TabsTrigger value="sop" className="data-[state=active]:bg-white py-2">
              <ScrollText className="h-4 w-4 mr-2" /> SOP Manager
            </TabsTrigger>
            <TabsTrigger value="professors" className="data-[state=active]:bg-white py-2">
              <GraduationCap className="h-4 w-4 mr-2" /> Professors
            </TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-white py-2">
              <BookOpen className="h-4 w-4 mr-2" /> Applications
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-white py-2">
              <Sparkles className="h-4 w-4 mr-2" /> AI Suggestion
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4 animate-in fade-in duration-300">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-2xl">Letter Tracking</CardTitle>
                  <CardDescription>Monitor the status of your requested letters.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-accent/10">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead>Professor</TableHead>
                        <TableHead>Application</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">
                            No requests logged yet. Start by adding a professor and an application.
                          </TableCell>
                        </TableRow>
                      ) : (
                        requests.map(req => (
                          <LoRRequestRow 
                            key={req.id} 
                            request={req} 
                            onStatusChange={updateRequestStatus}
                            onWrite={setEditingRequest}
                            onDelete={deleteRequest}
                            professor={professors.find(p => p.id === req.professorId)}
                            application={applications.find(a => a.id === req.applicationId)}
                          />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sop" className="space-y-4 animate-in fade-in duration-300">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-2xl">SOP Manager</CardTitle>
                  <CardDescription>Draft and track your Statements of Purpose for different colleges.</CardDescription>
                </div>
                <NewSopDialog onAdd={addSop} />
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-accent/10">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead>College</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sops.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">
                            No SOPs added yet. Click &quot;New SOP&quot; to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        sops.map(sop => (
                          <SopRow
                            key={sop.id}
                            sop={sop}
                            onStatusChange={updateSopStatus}
                            onWrite={setEditingSop}
                            onDelete={deleteSop}
                          />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professors" className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-headline font-bold text-primary">Faculty Network</h3>
                <p className="text-sm text-muted-foreground font-literata">Maintain contact details and areas of expertise for your recommenders.</p>
              </div>
              <NewProfessorDialog onAdd={addProfessor} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {professors.map(prof => (
                <ProfessorCard key={prof.id} professor={prof} onDelete={deleteProfessor} />
              ))}
              {professors.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
                  <p className="text-muted-foreground">You haven&apos;t added any professor profiles yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-headline font-bold text-primary">Application Targets</h3>
                <p className="text-sm text-muted-foreground font-literata">List the programs and scholarships you are applying to.</p>
              </div>
              <NewApplicationDialog onAdd={addApplication} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {applications.map(app => (
                <Card key={app.id} className="group overflow-hidden border-accent/20">
                  <div className="h-2 bg-accent/20 w-full" />
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-primary">{app.university}</CardTitle>
                        <CardDescription className="text-accent font-bold">{app.program}</CardDescription>
                      </div>
                      <Badge variant="outline" className="border-accent text-accent">
                        {app.deadline}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="font-literata text-sm text-muted-foreground italic">
                    {app.description || "No specific notes provided."}
                  </CardContent>
                  <CardFooter className="bg-muted/20 py-3 flex justify-end">
                    <button 
                      onClick={() => deleteApplication(app.id)}
                      className="text-xs text-destructive hover:underline font-bold"
                    >
                      Remove Target
                    </button>
                  </CardFooter>
                </Card>
              ))}
              {applications.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
                  <p className="text-muted-foreground">No applications tracked yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ai" className="animate-in fade-in duration-300">
            <div className="max-w-3xl mx-auto">
              <AISuggestionTool professors={professors} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
