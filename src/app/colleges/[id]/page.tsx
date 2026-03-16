"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Calendar, ExternalLink, FileText, GraduationCap, Link2, Loader2, Plus, Share2, Trash2, User } from "lucide-react";
import { ApplicationResourcesSection } from "@/components/dashboard/ApplicationResourcesSection";
import { NewApplicationDialog } from "@/components/dashboard/NewApplicationDialog";
import { LoREditor } from "@/components/dashboard/LoREditor";
import { NewRequestDialog } from "@/components/dashboard/NewRequestDialog";
import { NewSopDialog } from "@/components/dashboard/NewSopDialog";
import { SopEditor } from "@/components/dashboard/SopEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useGeminiKey } from "@/hooks/use-gemini-key";
import { useLoRStore } from "@/lib/store";
import { useSopStore } from "@/lib/sopStore";
import type { LoRRequest, SopEntry } from "@/lib/types";

function formatDeadline(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "Unknown" : format(parsed, "MMM d, yyyy");
}

export default function CollegeDetailPage() {
  const params = useParams<{ id: string }>();
  const applicationId = typeof params?.id === "string" ? params.id : "";
  const {
    user,
    authLoading,
    professors,
    applications,
    requests,
    resources,
    isLoading,
    addRequest,
    updateApplication,
    addResource,
    uploadResource,
    updateResourceTags,
    deleteResource,
    deleteRequest,
    updateRequestContent,
    generateShareToken,
    generateApplicationShareToken,
  } = useLoRStore();
  const {
    sops,
    isLoading: isSopLoading,
    addSop,
    deleteSop,
    updateSopContent,
  } = useSopStore(user?.id ?? null);
  const { toast } = useToast();
  const { geminiKey } = useGeminiKey();
  const [editingRequest, setEditingRequest] = useState<LoRRequest | null>(null);
  const [editingSop, setEditingSop] = useState<SopEntry | null>(null);
  const [isSharingShortlist, setIsSharingShortlist] = useState(false);
  const [deletingSopId, setDeletingSopId] = useState<string | null>(null);
  const [deletingRequestId, setDeletingRequestId] = useState<string | null>(null);

  const application = useMemo(
    () => applications.find((entry) => entry.id === applicationId) ?? null,
    [applicationId, applications]
  );
  const connectedSops = useMemo(() => {
    if (!application) return [];
    return sops.filter((sop) =>
      sop.applicationId === application.id ||
      (!sop.applicationId &&
        sop.college === application.university &&
        sop.program === application.program)
    );
  }, [application, sops]);
  const connectedRequests = useMemo(() => {
    if (!application) return [];
    return requests.filter((request) => request.applicationId === application.id);
  }, [application, requests]);
  const applicationResources = useMemo(() => {
    if (!application) return [];
    return resources.filter((resource) => resource.applicationId === application.id);
  }, [application, resources]);

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

  const handleShareShortlist = async () => {
    if (!application) return;

    try {
      setIsSharingShortlist(true);
      const token = await generateApplicationShareToken(application.id);
      if (!token) {
        toast({
          title: "Unable to share shortlist",
          description: "Please try again in a moment.",
          variant: "destructive",
        });
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

      try {
        await navigator.clipboard.writeText(`${baseUrl}/shortlist/${token}`);
        toast({
          title: "Public link copied",
          description: "The college shortlist link is ready to share.",
        });
      } catch {
        toast({
          title: "Share link created",
          description: `${baseUrl}/shortlist/${token}`,
        });
      }
    } finally {
      setIsSharingShortlist(false);
    }
  };

  const handleDeleteSop = async (id: string) => {
    try {
      setDeletingSopId(id);
      await deleteSop(id);
      if (editingSop?.id === id) {
        setEditingSop(null);
      }
    } finally {
      setDeletingSopId(null);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      setDeletingRequestId(id);
      await deleteRequest(id);
      if (editingRequest?.id === id) {
        setEditingRequest(null);
      }
    } finally {
      setDeletingRequestId(null);
    }
  };

  const handleAddResourceLink = async (data: { title: string; url: string; tags: string[] }) => {
    if (!application) return;
    const success = await addResource({
      id: crypto.randomUUID(),
      applicationId: application.id,
      resourceType: "link",
      title: data.title,
      url: data.url,
      tags: data.tags,
    });

    if (!success) {
      throw new Error("Unable to add resource link");
    }
  };

  const handleUploadResourceFile = async (data: { title: string; file: File; tags: string[] }) => {
    if (!application) return;
    const createdResource = await uploadResource({
      applicationId: application.id,
      title: data.title,
      tags: data.tags,
      file: data.file,
    });

    if (!createdResource) {
      throw new Error("Unable to upload resource file");
    }
  };

  const handleUpdateResourceTags = async (resourceId: string, tags: string[]) => {
    const success = await updateResourceTags(resourceId, tags);
    if (!success) {
      throw new Error("Unable to update resource tags");
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    const success = await deleteResource(resourceId);
    if (!success) {
      throw new Error("Unable to delete resource");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Loading college workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-lg w-full border-accent/20">
          <CardContent className="p-8 space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-2xl font-headline font-bold text-primary">College Workspace</h1>
              <p className="text-sm text-muted-foreground">
                Sign in from the main dashboard to manage this college shortlist.
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

  if ((isLoading || isSopLoading) && !application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Loading college details…</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-lg w-full border-accent/20">
          <CardContent className="p-8 space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-2xl font-headline font-bold text-primary">College not found</h1>
              <p className="text-sm text-muted-foreground">
                This shortlist could not be found in your workspace.
              </p>
            </div>
            <Button asChild className="bg-primary text-primary-foreground">
              <Link href="/colleges">Back to college management</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <Toaster />

      {editingRequest && (
        <LoREditor
          request={editingRequest}
          professor={professors.find((professor) => professor.id === editingRequest.professorId)}
          application={application}
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

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-8">
        <div className="space-y-4">
          <Button asChild variant="ghost" className="px-0 text-muted-foreground hover:text-primary">
            <Link href="/colleges">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to college list
            </Link>
          </Button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-3">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">
                    {application.university}
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground">{application.program}</p>
                </div>
              </div>
              <p className="max-w-3xl text-sm text-muted-foreground font-body">
                {application.description || "No shortlist notes added yet."}
              </p>
              {application.relevantLinks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {application.relevantLinks.map((link) => (
                    <a
                      key={link}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-3 py-1 text-xs text-primary hover:bg-primary/5"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      {link}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-accent px-3 py-1 text-accent">
                <Calendar className="mr-2 h-4 w-4" />
                {formatDeadline(application.deadline)}
              </Badge>
              <NewApplicationDialog
                mode="edit"
                initialApplication={application}
                onUpdate={updateApplication}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  Edit Shortlist
                </Button>
              </NewApplicationDialog>
              <Button
                variant="outline"
                size="sm"
                className="border-info/50 text-info hover:bg-info/15"
                disabled={isSharingShortlist}
                onClick={() => void handleShareShortlist()}
              >
                {isSharingShortlist ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                {isSharingShortlist ? "Sharing..." : "Share Public Link"}
              </Button>
              <NewSopDialog onAdd={addSop} initialApplication={application} autoOpenOnInitialApplication={false}>
                <Button size="sm" className="bg-primary text-primary-foreground">
                  <Plus className="mr-2 h-4 w-4" />
                  Add SOP
                </Button>
              </NewSopDialog>
              <NewRequestDialog
                professors={professors}
                applications={applications}
                onAdd={addRequest}
                initialApplicationId={application.id}
                lockApplicationSelection
                autoOpenOnInitialApplication={false}
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <User className="mr-2 h-4 w-4" />
                  Add LOR
                </Button>
              </NewRequestDialog>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Connected SOPs</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-primary">{connectedSops.length}</CardContent>
          </Card>
          <Card className="border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Connected LORs</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-primary">{connectedRequests.length}</CardContent>
          </Card>
          <Card className="border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Shortlist Status</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Focus on this page to manage everything related to this college.
            </CardContent>
          </Card>
        </div>

        <ApplicationResourcesSection
          resources={applicationResources}
          onAddLink={handleAddResourceLink}
          onUploadFile={handleUploadResourceFile}
          onUpdateTags={handleUpdateResourceTags}
          onDelete={handleDeleteResource}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-accent/20">
            <CardHeader className="space-y-0">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-4 w-4 text-accent" />
                Connected SOPs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-accent/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Program</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {connectedSops.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="py-8 text-center text-muted-foreground italic">
                          No SOPs linked to this shortlist yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      connectedSops.map((sop) => (
                        <TableRow key={sop.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-primary">{sop.program}</span>
                              <span className="text-xs text-muted-foreground">
                                Deadline {formatDeadline(sop.deadline)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={sop.status === "Finalized" ? "default" : sop.status === "In Progress" ? "secondary" : "outline"}>
                              {sop.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {sop.googleDocsLink ? (
                                <Button asChild variant="outline" size="sm">
                                  <a href={sop.googleDocsLink} target="_blank" rel="noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Open Doc
                                  </a>
                                </Button>
                              ) : (
                              <Button variant="ghost" size="sm" onClick={() => setEditingSop(sop)}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open
                              </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => void handleDeleteSop(sop.id)}
                                disabled={deletingSopId === sop.id}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                aria-label="Delete SOP"
                              >
                                {deletingSopId === sop.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader className="space-y-0">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-4 w-4 text-accent" />
                Connected LORs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-accent/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Professor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {connectedRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="py-8 text-center text-muted-foreground italic">
                          No LORs linked to this shortlist yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      connectedRequests.map((request) => {
                        const professor = professors.find((entry) => entry.id === request.professorId);
                        return (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-primary">{professor?.name || "Unknown Professor"}</span>
                                <span className="text-xs text-muted-foreground">
                                  Deadline {formatDeadline(request.deadline)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={request.status === "Submitted" ? "default" : request.status === "In Progress" ? "secondary" : "outline"}>
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {request.googleDocsLink ? (
                                  <Button asChild variant="outline" size="sm">
                                    <a href={request.googleDocsLink} target="_blank" rel="noreferrer">
                                      <ExternalLink className="mr-2 h-4 w-4" />
                                      Open Doc
                                    </a>
                                  </Button>
                                ) : (
                                  <Button variant="ghost" size="sm" onClick={() => setEditingRequest(request)}>
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Open
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => void handleDeleteRequest(request.id)}
                                  disabled={deletingRequestId === request.id}
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  aria-label="Delete LOR"
                                >
                                  {deletingRequestId === request.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
