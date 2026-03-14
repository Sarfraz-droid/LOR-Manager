"use client";

import { format } from "date-fns";
import { BookOpen, Calendar, FileText, GraduationCap, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function ShortlistShareView({ shortlist, sops, lors }: SharedShortlistData) {
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sops.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="py-8 text-center text-muted-foreground italic">
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="py-8 text-center text-muted-foreground italic">
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
    </div>
  );
}
