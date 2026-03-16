"use client";

import { format } from "date-fns";
import { BookOpen, Calendar, Eye, FileUp, FileText, GraduationCap, Link2, User } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SharedShortlistData {
  token: string;
  shortlist: {
    university: string;
    program: string;
    deadline: string;
    description: string;
    relevantLinks: string[];
  };
  sops: Array<{
    id: string;
    program: string;
    deadline: string;
    status: string;
    content: string;
    googleDocsLink?: string;
  }>;
  lors: Array<{
    id: string;
    deadline: string;
    status: string;
    content: string;
    professorName: string;
    googleDocsLink?: string;
  }>;
  resources: Array<{
    id: string;
    resourceType: "upload" | "link";
    title: string;
    url?: string;
    filename?: string;
    mimeType?: string;
    sizeBytes?: number;
    tags: string[];
    openUrl?: string;
  }>;
}

function formatBytes(value?: number) {
  if (!value || value <= 0) return "Unknown size";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function ShortlistShareView({ token, shortlist, sops, lors, resources }: SharedShortlistData) {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <Card className="border-border/70 bg-card/95 shadow-lg shadow-black/20">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/15 p-3">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-primary">{shortlist.university}</h1>
                    <p className="text-sm text-muted-foreground">{shortlist.program}</p>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="border-accent px-3 py-1 text-accent">
                <Calendar className="mr-2 h-4 w-4" />
                {shortlist.deadline ? format(new Date(shortlist.deadline), "MMM d, yyyy") : "No deadline"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {shortlist.description || "This shared shortlist does not include any additional notes."}
            </p>
            {shortlist.relevantLinks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {shortlist.relevantLinks.map((link) => (
                  <a
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-3 py-1 text-xs text-primary hover:bg-primary/10"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    {link}
                  </a>
                ))}
              </div>
            )}
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-accent" />
                Connected SOPs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-accent/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-surface-1/60">
                    <TableRow>
                      <TableHead>Program</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sops.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="py-8 text-center text-muted-foreground italic">
                          No SOPs are linked to this shortlist.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sops.map((sop) => (
                        <TableRow key={sop.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-primary">{sop.program}</span>
                              <span className="text-xs text-muted-foreground">
                                Deadline {sop.deadline ? format(new Date(sop.deadline), "MMM d, yyyy") : "Unknown"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={sop.status === "Finalized" ? "default" : sop.status === "In Progress" ? "secondary" : "outline"}>
                              {sop.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 rounded-full hover:bg-secondary/70"
                              asChild
                              aria-label={`View SOP for ${sop.program}`}
                            >
                              {sop.googleDocsLink ? (
                                <a href={sop.googleDocsLink} target="_blank" rel="noreferrer">
                                  <Eye className="h-4 w-4" />
                                </a>
                              ) : (
                                <Link href={`/shortlist/${token}/sop/${sop.id}`} target="_blank">
                                  <Eye className="h-4 w-4" />
                                </Link>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-accent" />
                Connected LORs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-accent/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-surface-1/60">
                    <TableRow>
                      <TableHead>Professor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="py-8 text-center text-muted-foreground italic">
                          No LORs are linked to this shortlist.
                        </TableCell>
                      </TableRow>
                    ) : (
                      lors.map((lor) => (
                        <TableRow key={lor.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="flex items-center gap-2 font-medium text-primary">
                                <User className="h-3.5 w-3.5 text-accent" />
                                {lor.professorName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Deadline {lor.deadline ? format(new Date(lor.deadline), "MMM d, yyyy") : "Unknown"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={lor.status === "Submitted" ? "default" : lor.status === "In Progress" ? "secondary" : "outline"}>
                              {lor.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 rounded-full hover:bg-secondary/70"
                              asChild
                              aria-label={`View LOR from ${lor.professorName}`}
                            >
                              {lor.googleDocsLink ? (
                                <a href={lor.googleDocsLink} target="_blank" rel="noreferrer">
                                  <Eye className="h-4 w-4" />
                                </a>
                              ) : (
                                <Link href={`/shortlist/${token}/lor/${lor.id}`} target="_blank">
                                  <Eye className="h-4 w-4" />
                                </Link>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileUp className="h-5 w-5 text-accent" />
              Application Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-accent/10 overflow-hidden">
              <Table>
                <TableHeader className="bg-surface-1/60">
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground italic">
                        No files or links are attached to this shortlist.
                      </TableCell>
                    </TableRow>
                  ) : (
                    resources.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-primary">{resource.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {resource.resourceType === "upload"
                                ? `${resource.filename ?? "Uploaded file"} - ${formatBytes(resource.sizeBytes)}`
                                : resource.url ?? "External link"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={resource.resourceType === "upload" ? "secondary" : "outline"}>
                            {resource.resourceType === "upload" ? "Upload" : "Link"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {resource.tags.length === 0 ? (
                            <span className="text-xs text-muted-foreground">No tags</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {resource.tags.map((tag) => (
                                <Badge key={`${resource.id}-${tag}`} variant="outline" className="text-[10px]">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {(resource.resourceType === "link" && resource.url) ||
                          (resource.resourceType === "upload" && resource.openUrl) ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 rounded-full hover:bg-secondary/70"
                              asChild
                              aria-label={`Open resource ${resource.title}`}
                            >
                              <a
                                href={resource.resourceType === "upload" ? resource.openUrl : resource.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
