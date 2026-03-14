"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { BookOpen, Calendar, Eye, FileText, GraduationCap, User } from "lucide-react";
import DOMPurify from "dompurify";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SharedShortlistData {
  shortlist: {
    university: string;
    program: string;
    deadline: string;
    description: string;
  };
  sops: Array<{
    id: string;
    program: string;
    deadline: string;
    status: string;
    content: string;
  }>;
  lors: Array<{
    id: string;
    deadline: string;
    status: string;
    content: string;
    professorName: string;
  }>;
}

interface ContentViewDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  content: string;
}

function ContentViewDialog({ open, onClose, title, subtitle, content }: ContentViewDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const isHtml = /<(p|div|span|h[1-6]|ul|ol|li|blockquote|br|strong|em|a)\b/i.test(content);

  useEffect(() => {
    if (open && contentRef.current && isHtml) {
      contentRef.current.innerHTML = DOMPurify.sanitize(content);
    }
  }, [open, content, isHtml]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </DialogHeader>
        <div className="bg-white rounded-lg border border-muted/20 p-6 min-h-[40vh]">
          {content ? (
            isHtml ? (
              <div ref={contentRef} className="prose prose-slate max-w-none text-foreground" />
            ) : (
              <div className="prose prose-slate max-w-none text-foreground">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            )
          ) : (
            <p className="text-muted-foreground italic text-center py-12">
              This document has no content yet.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ShortlistShareView({ shortlist, sops, lors }: SharedShortlistData) {
  const [selectedSop, setSelectedSop] = useState<SharedShortlistData["sops"][number] | null>(null);
  const [selectedLor, setSelectedLor] = useState<SharedShortlistData["lors"][number] | null>(null);

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <Card className="border-accent/20 shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-3">
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
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-accent" />
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
                              className="h-8 w-8 p-0"
                              onClick={() => setSelectedSop(sop)}
                              aria-label={`View SOP for ${sop.program}`}
                            >
                              <Eye className="h-4 w-4" />
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

          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-accent" />
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
                              className="h-8 w-8 p-0"
                              onClick={() => setSelectedLor(lor)}
                              aria-label={`View LOR from ${lor.professorName}`}
                            >
                              <Eye className="h-4 w-4" />
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
      </div>

      {selectedSop && (
        <ContentViewDialog
          open={!!selectedSop}
          onClose={() => setSelectedSop(null)}
          title={`Statement of Purpose — ${selectedSop.program}`}
          subtitle={`Deadline: ${selectedSop.deadline ? format(new Date(selectedSop.deadline), "MMM d, yyyy") : "Unknown"} · Status: ${selectedSop.status}`}
          content={selectedSop.content}
        />
      )}

      {selectedLor && (
        <ContentViewDialog
          open={!!selectedLor}
          onClose={() => setSelectedLor(null)}
          title={`Letter of Recommendation — ${selectedLor.professorName}`}
          subtitle={`Deadline: ${selectedLor.deadline ? format(new Date(selectedLor.deadline), "MMM d, yyyy") : "Unknown"} · Status: ${selectedLor.status}`}
          content={selectedLor.content}
        />
      )}
    </div>
  );
}
