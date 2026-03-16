"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewApplicationDialog } from "@/components/dashboard/NewApplicationDialog";
import { NewRequestDialog } from "@/components/dashboard/NewRequestDialog";
import { NewSopDialog } from "@/components/dashboard/NewSopDialog";
import { useToast } from "@/hooks/use-toast";
import type { LoRRequest, Professor, SopEntry, UniversityApplication } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, ExternalLink, FileText, Loader2, Share2, Trash2 } from "lucide-react";

interface CollegeManagementSectionProps {
  applications: UniversityApplication[];
  requests: LoRRequest[];
  sops: SopEntry[];
  professors: Professor[];
  addApplication: (application: UniversityApplication) => void | Promise<void>;
  addRequest: (request: LoRRequest) => void | Promise<void>;
  addSop: (sop: SopEntry) => void | Promise<void>;
  deleteApplication: (applicationId: string) => void | Promise<void>;
  removeSopsForApplication: (applicationId: string) => void;
  generateApplicationShareToken: (applicationId: string) => Promise<string | null>;
  onOpenSop: (sop: SopEntry) => void;
  onOpenLor: (request: LoRRequest) => void;
  title?: string;
  description?: string;
  emptyMessage?: string;
}

export function CollegeManagementSection({
  applications,
  requests,
  sops,
  professors,
  addApplication,
  addRequest,
  addSop,
  deleteApplication,
  removeSopsForApplication,
  generateApplicationShareToken,
  onOpenSop,
  onOpenLor,
  title = "College Shortlists",
  description = "Open each college dashboard to review the shortlist, its connected SOPs, connected LORs, and its public share link.",
  emptyMessage = "No college shortlists tracked yet.",
}: CollegeManagementSectionProps) {
  const { toast } = useToast();
  const [shortlistForRequest, setShortlistForRequest] = useState<string | null>(null);
  const [shortlistForSop, setShortlistForSop] = useState<string | null>(null);
  const [sharingApplicationId, setSharingApplicationId] = useState<string | null>(null);
  const [deletingApplicationId, setDeletingApplicationId] = useState<string | null>(null);

  const shortlistedApplicationForSop = useMemo(
    () => applications.find((application) => application.id === shortlistForSop) ?? null,
    [applications, shortlistForSop]
  );

  const handleShareShortlist = async (applicationId: string) => {
    try {
      setSharingApplicationId(applicationId);
      const token = await generateApplicationShareToken(applicationId);
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
      setSharingApplicationId(null);
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    try {
      setDeletingApplicationId(applicationId);
      await deleteApplication(applicationId);
      removeSopsForApplication(applicationId);
    } finally {
      setDeletingApplicationId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-3">
          <div>
            <h3 className="text-2xl font-headline font-bold text-primary">{title}</h3>
            <p className="text-sm text-muted-foreground font-body">{description}</p>
          </div>
          <div className="flex gap-2">
            {/* <NewRequestDialog
              professors={professors}
              applications={applications}
              onAdd={addRequest}
              initialApplicationId={shortlistForRequest}
              onInitialApplicationHandled={() => setShortlistForRequest(null)}
            /> */}
            {/* <NewSopDialog
              onAdd={addSop}
              initialApplication={shortlistedApplicationForSop}
              onInitialApplicationHandled={() => setShortlistForSop(null)}
            /> */}
            <NewApplicationDialog onAdd={addApplication} />
          </div>
        </div>

        <div className="rounded-md border border-accent/10 overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>College</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-center">SOPs</TableHead>
                <TableHead className="text-center">LORs</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Relevant Links</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground italic">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => {
                  const appSops = sops.filter((sop) =>
                    sop.applicationId === app.id ||
                    (!sop.applicationId &&
                      sop.college === app.university &&
                      sop.program === app.program)
                  );
                  const appRequests = requests.filter((request) => request.applicationId === app.id);
                  const sopDocLink = appSops.find((sop) => Boolean(sop.googleDocsLink))?.googleDocsLink;
                  const lorDocLink = appRequests.find((request) => Boolean(request.googleDocsLink))?.googleDocsLink;

                  return (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <Link
                            href={`/colleges/${app.id}`}
                            className="font-semibold text-primary hover:underline"
                          >
                            {app.university}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            Open the full college workspace
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-accent">{app.program}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-accent text-accent">
                          {app.deadline}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold text-primary">{appSops.length}</span>
                          {sopDocLink && (
                            <a
                              href={sopDocLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              Open Doc
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold text-primary">{appRequests.length}</span>
                          {lorDocLink && (
                            <a
                              href={lorDocLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              Open Doc
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs text-sm text-muted-foreground">
                        <span className="line-clamp-2">{app.description || "No shortlist notes provided."}</span>
                      </TableCell>
                      <TableCell className="max-w-xs text-sm text-muted-foreground">
                        {app.relevantLinks.length === 0 ? (
                          <span>No links added.</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {app.relevantLinks.slice(0, 2).map((link) => (
                              <a
                                key={link}
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                className="truncate text-primary hover:underline"
                              >
                                {link}
                              </a>
                            ))}
                            {app.relevantLinks.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{app.relevantLinks.length - 2} more link(s)
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button asChild variant="default" size="sm" className="bg-primary text-primary-foreground">
                            <Link href={`/colleges/${app.id}`}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open Page
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-accent/30 text-accent hover:bg-accent/10"
                            onClick={() => setShortlistForSop(app.id)}
                            title="Add SOP"
                            aria-label="Add SOP"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-primary/30 text-primary hover:bg-primary/10"
                            onClick={() => setShortlistForRequest(app.id)}
                            title="Add LOR"
                            aria-label="Add LOR"
                          >
                            <BookOpen className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-info hover:bg-info/15 hover:text-info"
                            disabled={sharingApplicationId === app.id || deletingApplicationId === app.id}
                            onClick={() => void handleShareShortlist(app.id)}
                            title="Share shortlist"
                            aria-label="Share shortlist"
                          >
                            {sharingApplicationId === app.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Share2 className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => void handleDeleteApplication(app.id)}
                            disabled={deletingApplicationId === app.id || sharingApplicationId === app.id}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Remove shortlist"
                            aria-label="Remove shortlist"
                          >
                            {deletingApplicationId === app.id ? (
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
      </div>
    </>
  );
}
