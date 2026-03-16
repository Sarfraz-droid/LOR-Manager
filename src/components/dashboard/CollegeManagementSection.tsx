"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewApplicationDialog } from "@/components/dashboard/NewApplicationDialog";
import type { LoRRequest, SopEntry, UniversityApplication } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink } from "lucide-react";

interface CollegeManagementSectionProps {
  applications: UniversityApplication[];
  requests: LoRRequest[];
  sops: SopEntry[];
  addApplication: (application: UniversityApplication) => void | Promise<void>;
  title?: string;
  description?: string;
  emptyMessage?: string;
}

export function CollegeManagementSection({
  applications,
  requests,
  sops,
  addApplication,
  title = "College Shortlists",
  description = "Open each college dashboard to review the shortlist, its connected SOPs, connected LORs, and its public share link.",
  emptyMessage = "No college shortlists tracked yet.",
}: CollegeManagementSectionProps) {
  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-3">
          <div>
            <h3 className="text-2xl font-headline font-bold text-primary">{title}</h3>
            <p className="text-sm text-muted-foreground font-body">{description}</p>
          </div>
          <div className="flex gap-2">
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
