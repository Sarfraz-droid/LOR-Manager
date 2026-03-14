"use client";

import { format } from "date-fns";
import { BookOpen, Calendar, ExternalLink, FileText, GraduationCap, Share2, Sparkles, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoRRequest, Professor, SopEntry, UniversityApplication } from "@/lib/types";

function formatDeadline(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "Unknown" : format(parsed, "MMM d, yyyy");
}

interface CollegeDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: UniversityApplication | null;
  sops: SopEntry[];
  requests: LoRRequest[];
  professors: Professor[];
  onCreateSop: () => void;
  onCreateLor: () => void;
  onOpenSop: (sop: SopEntry) => void;
  onOpenLor: (request: LoRRequest) => void;
  onShare: () => void;
}

export function CollegeDashboardDialog({
  open,
  onOpenChange,
  application,
  sops,
  requests,
  professors,
  onCreateSop,
  onCreateLor,
  onOpenSop,
  onOpenLor,
  onShare,
}: CollegeDashboardDialogProps) {
  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader className="pr-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <DialogTitle className="flex items-center gap-2 text-primary">
                <GraduationCap className="h-5 w-5 text-accent" />
                {application.university}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {application.program}
              </DialogDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-accent text-accent">
                <Calendar className="mr-1 h-3 w-3" />
                {formatDeadline(application.deadline)}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={onShare}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Public Link
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Connected SOPs</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-primary">{sops.length}</CardContent>
          </Card>
          <Card className="border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Connected LORs</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-primary">{requests.length}</CardContent>
          </Card>
          <Card className="border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Shortlist Status</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {application.description || "No shortlist notes added yet."}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-4 w-4 text-accent" />
                  Connected SOPs
                </CardTitle>
              </div>
              <Button size="sm" className="bg-primary text-primary-foreground" onClick={onCreateSop}>
                <Sparkles className="mr-2 h-4 w-4" />
                Add SOP
              </Button>
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
                    {sops.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="py-8 text-center text-muted-foreground italic">
                          No SOPs linked to this shortlist yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sops.map((sop) => (
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
                            <Button variant="ghost" size="sm" onClick={() => onOpenSop(sop)}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open
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
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-4 w-4 text-accent" />
                  Connected LORs
                </CardTitle>
              </div>
              <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10" onClick={onCreateLor}>
                <User className="mr-2 h-4 w-4" />
                Add LOR
              </Button>
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
                    {requests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="py-8 text-center text-muted-foreground italic">
                          No LORs linked to this shortlist yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      requests.map((request) => {
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
                              <Button variant="ghost" size="sm" onClick={() => onOpenLor(request)}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open
                              </Button>
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
      </DialogContent>
    </Dialog>
  );
}
